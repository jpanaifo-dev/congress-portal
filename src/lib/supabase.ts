// Client to query Supabase REST API (PostgREST) using native fetch

// Helper for generic REST requests
async function supabaseRequest(path: string, options: RequestInit = {}) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${path}`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  
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

export function fetchConfig(): Promise<EventConfig> {
  if (!cachedConfigPromise) {
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

// 3. Fetch Speakers
export async function fetchSpeakers(editionId: string) {
  try {
    // Get speakers through session_speakers filtered by the active edition sessions
    const data = await supabaseRequest(
      `session_speakers?select=is_main_speaker,event_participants(id,profiles(id,first_name,last_name,avatar_url,bio,dedication,institution,social_links)),event_sessions!inner(edition_id)&event_sessions.edition_id=eq.${editionId}`
    );
    
    // Deduplicate speakers by profile id
    const speakersMap = new Map();
    data.forEach((row: any) => {
      const profile = row.event_participants?.profiles;
      if (profile && !speakersMap.has(profile.id)) {
        speakersMap.set(profile.id, {
          id: profile.id,
          full_name: `${profile.first_name} ${profile.last_name}`.trim(),
          specialty: profile.dedication || (profile.expertise_areas?.[0] || 'Investigador'),
          bio: profile.bio || '',
          photo_url: profile.avatar_url || '',
          institution: profile.institution || '',
          socials: typeof profile.social_links === 'string' ? JSON.parse(profile.social_links) : (profile.social_links || {})
        });
      }
    });
    return Array.from(speakersMap.values());
  } catch (err) {
    console.error('Error loading speakers:', err);
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
  phone: string;
  institution: string;
  researchArea: string;
  participantType: string;
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
    dedication: data.participantType,
    areas_of_interest: [data.researchArea],
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
    attendance_mode: 'in_person',
    created_at: new Date().toISOString()
  };

  return await supabaseRequest('event_participants', {
    method: 'POST',
    body: JSON.stringify(participantPayload)
  });
}
