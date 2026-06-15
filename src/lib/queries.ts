/**
 * GraphQL Queries and Mutations matching the database schema
 */

export const GET_SPEAKERS = `
  query GetSpeakers {
    speakers {
      id
      full_name
      specialty
      bio
      photo_url
      institution
      created_at
    }
  }
`;

export const GET_ACTIVE_EDITION_DETAILS = `
  query GetActiveEditionDetails {
    editions(where: { is_active: { _eq: true } }) {
      id
      slug
      title
      start_date
      end_date
      is_active
      event {
        id
        name
        description
      }
      sessions(order_by: { start_time: asc }) {
        id
        title
        description
        type
        start_time
        end_time
        location
        session_speakers {
          speaker {
            id
            full_name
            specialty
            photo_url
          }
        }
      }
    }
  }
`;

export const GET_USER_REGISTRATIONS = `
  query GetUserRegistrations($profileId: uuid!) {
    registrations(where: { profile_id: { _eq: $profileId } }) {
      id
      participation_type
      research_area
      payment_status
      voucher_url
      certificate_issued
      created_at
      edition {
        title
        start_date
      }
    }
  }
`;

export const CREATE_PARTICIPANT_REGISTRATION = `
  mutation CreateParticipantRegistration(
    $profileId: uuid!,
    $email: String!,
    $fullName: String!,
    $phone: String,
    $institution: String,
    $editionId: uuid!,
    $participationType: participation_type_enum!,
    $researchArea: research_area_enum,
    $voucherUrl: String
  ) {
    insert_profiles_one(
      object: {
        id: $profileId,
        email: $email,
        full_name: $fullName,
        phone: $phone,
        institution: $institution,
        role: participant
      },
      on_conflict: {
        constraint: profiles_pkey,
        update_columns: [full_name, phone, institution]
      }
    ) {
      id
      email
      full_name
      role
    }
    insert_registrations_one(
      object: {
        profile_id: $profileId,
        edition_id: $editionId,
        participation_type: $participationType,
        research_area: $researchArea,
        payment_status: pending,
        voucher_url: $voucherUrl
      }
    ) {
      id
      participation_type
      research_area
      payment_status
      created_at
    }
  }
`;
