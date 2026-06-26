// Client to query Supabase REST API (PostgREST) using native fetch

// Helper for generic REST requests
async function supabaseRequest(path: string, options: RequestInit = {}) {
  const isClient = typeof window !== 'undefined';
  const urlBase = isClient ? (window as any).__SUPABASE_URL__ : import.meta.env.VITE_SUPABASE_URL;
  const anonKey = isClient ? (window as any).__SUPABASE_ANON_KEY__ : (import.meta.env.VITE_SUPABASE_ANON_KEY || "");

  const url = `${urlBase}/rest/v1/${path}`;
  
  const headers: Record<string, string> = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };
  
  if (options.headers) {
    const incomingHeaders = new Headers(options.headers);
    incomingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }
  
  if (options.method && options.method !== 'GET') {
    headers['Prefer'] = 'return=representation';
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    let parsedError;
    try {
      parsedError = JSON.parse(errorText);
    } catch {
      parsedError = null;
    }
    const message = parsedError?.message || parsedError?.details || errorText || response.statusText;
    throw new Error(message);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Interfaces for our config
export interface EventConfig {
  globalSettings: {
    app_name: string;
    is_online: boolean;
    active_event_slug: string | null;
    social_networks: any;
    format_summary_url: string | null;
  } | null;
  event: {
    id: string;
    organization_id: string;
    owner_id: string;
    slug: string;
    name: string;
    short_description: string | null;
    about: any;
    logo_url: string | null;
    cover_url: string | null;
    brand_colors: { primary: string; secondary: string } | null;
    status: string;
    website_url: string | null;
    contact_email: string | null;
    social_links: any;
    settings: any;
    location?: string | null;
    modality?: string | null;
  } | null;
  edition: {
    id: string;
    main_event_id: string;
    slug: string;
    year: number;
    name: any;
    description: any;
    cover_url: string | null;
    start_date: string;
    end_date: string;
    is_current: boolean;
    location?: string | null;
    modality?: string | null;
  } | null;
}

// 1. Fetch unified config
let cachedConfigPromise: Promise<EventConfig> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 3000; // 3 seconds

export function fetchConfig(): Promise<EventConfig> {
  const now = Date.now();
  if (!cachedConfigPromise || (now - lastFetchTime > CACHE_TTL)) {
    lastFetchTime = now;
    cachedConfigPromise = (async () => {
      let globalSettings = null;
      let event = null;
      let edition = null;

      try {
        // A. Query global_settings
        const settingsList = await supabaseRequest('global_settings?select=*&order=updated_at.desc&limit=1');
        if (settingsList && settingsList.length > 0) {
          globalSettings = settingsList[0];
        }
      } catch (err) {
        console.error('Error fetching global settings:', err);
      }

      // B. Determine active event slug
      const envSlug = import.meta.env.APP_NAME_SLUG || "";
      const activeSlug = envSlug || globalSettings?.active_event_slug;

      if (activeSlug) {
        try {
          // C. Query main_event by slug
          const eventList = await supabaseRequest(`main_events?slug=eq.${activeSlug}&select=*`);
          if (eventList && eventList.length > 0) {
            event = eventList[0];
          }
        } catch (err) {
          console.error(`Error fetching main event for slug ${activeSlug}:`, err);
        }
      }

      // Fallback to first event if not found
      if (!event) {
        try {
          const eventList = await supabaseRequest('main_events?select=*&limit=1');
          if (eventList && eventList.length > 0) {
            event = eventList[0];
          }
        } catch (err) {
          console.error('Error fetching fallback main event:', err);
        }
      }

      // D. Query current edition
      if (event) {
        try {
          const editionsList = await supabaseRequest(`editions?main_event_id=eq.${event.id}&is_current=eq.true&select=*`);
          if (editionsList && editionsList.length > 0) {
            edition = editionsList[0];
          } else {
            // Fallback to latest edition by year
            const latestEditions = await supabaseRequest(`editions?main_event_id=eq.${event.id}&select=*&order=year.desc&limit=1`);
            if (latestEditions && latestEditions.length > 0) {
              edition = latestEditions[0];
            }
          }
        } catch (err) {
          console.error(`Error fetching edition for event ${event.id}:`, err);
        }
      }

      return {
        globalSettings,
        event,
        edition
      };
    })();
  }
  return cachedConfigPromise;
}

// 2. Fetch Sessions / Program Schedule
export async function fetchSessions(editionId: string) {
  try {
    return await supabaseRequest(
      `event_sessions?edition_id=eq.${editionId}&is_active=eq.true&select=*,facility:facilities(name,address),session_speakers(is_main_speaker,order_index,event_participants(id,profile:profiles(id,first_name,last_name,avatar_url,bio,dedication,institution,expertise_areas,social_links)))&order=session_date.asc,start_time.asc`
    );
  } catch (err) {
    console.error('Error loading sessions:', err);
    return [];
  }
}

// 2b. Fetch Event Activities (cronograma)
export async function fetchActivities(editionId: string) {
  try {
    return await supabaseRequest(
      `event_activities?edition_id=eq.${editionId}&status=neq.DRAFT&select=*,speaker:event_participants(id,profile:profiles(id,first_name,last_name,avatar_url,bio,dedication,institution,expertise_areas,social_links))&order=start_time.asc`
    );
  } catch (err) {
    console.error('Error loading activities:', err);
    return [];
  }
}

// 3. Fetch Speakers
export async function fetchSpeakers(editionId: string) {
  try {
    // 1. Fetch participant roles to identify 'speaker' and 'keynote-speaker' slugs
    const roles = await supabaseRequest('participant_roles?select=id,slug');
    const speakerRoleIds = new Set<string>();
    
    if (roles && roles.length > 0) {
      roles.forEach((r: any) => {
        if (r.slug === 'speaker' || r.slug === 'keynote-speaker') {
          speakerRoleIds.add(r.id);
        }
      });
    }

    // 2. Fetch event participants for this edition
    const participants = await supabaseRequest(
      `event_participants?edition_id=eq.${editionId}&select=id,role_id,profile:profile_id(id,first_name,last_name,avatar_url,bio,dedication,institution,social_links)`
    );

    const speakersList: any[] = [];
    const seenProfileIds = new Set<string>();

    if (participants && participants.length > 0) {
      participants.forEach((part: any) => {
        // Filter by the speaker role IDs we identified
        if (speakerRoleIds.has(part.role_id) || part.role_id === 'cd7f72c1-51a1-41b3-a36c-fdea56707d30') {
          const profile = part.profile;
          if (profile && !seenProfileIds.has(profile.id)) {
            seenProfileIds.add(profile.id);
            speakersList.push({
              id: profile.id,
              full_name: `${profile.first_name} ${profile.last_name}`.trim(),
              specialty: profile.dedication || (profile.expertise_areas?.[0] || 'Ponente'),
              bio: profile.bio || '',
              photo_url: profile.avatar_url || '',
              institution: profile.institution || 'UNAP',
              socials: typeof profile.social_links === 'string' ? JSON.parse(profile.social_links) : (profile.social_links || {})
            });
          }
        }
      });
    }

    return speakersList;
  } catch (err) {
    console.error('Error loading speakers from event_participants:', err);
    throw err;
  }
}

// 3b. Fetch Thematic Lines
export async function fetchThematicLines(editionId: string) {
  try {
    return await supabaseRequest(`thematic_lines?edition_id=eq.${editionId}&is_active=eq.true&select=*`);
  } catch (err) {
    console.error('Error loading thematic lines:', err);
    return [];
  }
}

// 3c. Fetch Event Tickets
export async function fetchEventTickets(editionId: string) {
  try {
    return await supabaseRequest(`event_tickets?edition_id=eq.${editionId}&is_active=eq.true&order=price.asc`);
  } catch (err) {
    console.error('Error loading event tickets:', err);
    return [];
  }
}


// 4. Registration Validation
export async function checkProfileRegistration(email: string, docType: string, docNumber: string, editionId: string) {
  // Check if a profile with the email or doc number exists, and return its ID and edition participants
  const queryUrl = `profiles?select=id,email,identity_document_type,identity_document_number,event_participants(id,edition_id)&or=(email.eq.${email},and(identity_document_type.eq.${docType},identity_document_number.eq.${docNumber}))`;
  const profiles = await supabaseRequest(queryUrl);
  
  if (profiles && profiles.length > 0) {
    const profile = profiles[0];
    const registrations = profile.event_participants || [];
    const isAlreadyRegistered = registrations.some((reg: any) => reg.edition_id === editionId);
    
    return {
      exists: true,
      profileId: profile.id,
      isRegisteredForEdition: isAlreadyRegistered
    };
  }
  
  return {
    exists: false,
    profileId: null,
    isRegisteredForEdition: false
  };
}

// 5. Create Profile & Registration
export async function createRegistration(data: {
  profileId: string | null;
  email: string;
  firstNames: string;
  lastNames: string;
  docType: string;
  docNumber: string;
  phone?: string;
  institution: string;
  researchArea?: string;
  participantType?: string;
  ticketReference?: string;
  editionId: string;
  mainEventId: string;
}) {
  let profileId = data.profileId;

  const profilePayload = {
    email: data.email,
    first_name: data.firstNames,
    last_name: data.lastNames,
    identity_document_type: data.docType,
    identity_document_number: data.docNumber,
    phone: data.phone || null,
    institution: data.institution || null,
    dedication: data.participantType || null,
    areas_of_interest: data.researchArea ? [data.researchArea] : null,
    onboarding_completed: true,
    global_role: 'user',
    updated_at: new Date().toISOString()
  };

  if (profileId) {
    // Update existing profile
    await supabaseRequest(`profiles?id=eq.${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify(profilePayload)
    });
  } else {
    // Insert new profile
    const newProfiles = await supabaseRequest('profiles', {
      method: 'POST',
      body: JSON.stringify({
        ...profilePayload,
        created_at: new Date().toISOString()
      })
    });
    if (newProfiles && newProfiles.length > 0) {
      profileId = newProfiles[0].id;
    } else {
      throw new Error("No se pudo obtener el ID del perfil creado.");
    }
  }

  // Find participant_roles for 'participant' or fetch first active role
  let roleId = null;
  try {
    const rolesList = await supabaseRequest(`participant_roles?main_event_id=eq.${data.mainEventId}&slug=eq.participant&select=id`);
    if (rolesList && rolesList.length > 0) {
      roleId = rolesList[0].id;
    } else {
      // Fallback: check general 'participant' role
      const fallbackList = await supabaseRequest(`participant_roles?slug=eq.participant&select=id&limit=1`);
      if (fallbackList && fallbackList.length > 0) {
        roleId = fallbackList[0].id;
      } else {
        // Fallback: fetch any active role for this event
        const eventRoles = await supabaseRequest(`participant_roles?main_event_id=eq.${data.mainEventId}&select=id&limit=1`);
        if (eventRoles && eventRoles.length > 0) {
          roleId = eventRoles[0].id;
        } else {
          // Fallback: query roles table or use any participant_role
          const anyRoles = await supabaseRequest(`participant_roles?select=id&limit=1`);
          if (anyRoles && anyRoles.length > 0) {
            roleId = anyRoles[0].id;
          }
        }
      }
    }
  } catch (err) {
    console.error("Error querying participant roles:", err);
  }

  if (!roleId) {
    // If absolutely no participant roles exist in the database, we can create one!
    try {
      const createdRoles = await supabaseRequest('participant_roles', {
        method: 'POST',
        body: JSON.stringify({
          main_event_id: data.mainEventId,
          edition_id: data.editionId,
          slug: 'participant',
          name: { es: 'Participante', en: 'Participant' },
          badge_color: '#4CAF50',
          is_active: true
        })
      });
      if (createdRoles && createdRoles.length > 0) {
        roleId = createdRoles[0].id;
      }
    } catch (err) {
      console.error("Error creating participant role:", err);
    }
  }

  if (!roleId) {
    throw new Error("No se encontró ni se pudo crear un rol de participante (participant_role) en la base de datos.");
  }

  // Insert into event_participants
  const participantPayload = {
    main_event_id: data.mainEventId,
    edition_id: data.editionId,
    profile_id: profileId,
    role_id: roleId,
    check_in_status: false,
    requires_certificate: true,
    ticket_reference: data.ticketReference || null,
    attendance_mode: 'in_person',
    created_at: new Date().toISOString()
  };

  const result = await supabaseRequest('event_participants', {
    method: 'POST',
    body: JSON.stringify(participantPayload)
  });

  // ── Fire-and-forget: Send welcome email via server API ──────────
  // Calls the server-side endpoint where the Resend API key is available.
  // This never blocks the registration response.
  const emailPayload = {
    participantName: `${data.firstNames} ${data.lastNames}`.trim(),
    participantEmail: data.email,
    institution: data.institution,
    ticketCategory: data.ticketReference || 'Participante',
    documentType: data.docType,
    documentNumber: data.docNumber,
    eventName: 'III Encuentro Científico',
  };

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:4321';

  fetch(`${baseUrl}/api/send-welcome-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailPayload),
  }).catch((err) => {
    console.error('[Registration] Error al enviar email de bienvenida:', err);
  });

  return result;
}
