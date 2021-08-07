import { gql } from '@apollo/client';

export const PROJECT_STRUCTURE_QUERY = gql`
  query($projectId: UUID!) {
    project(vid: $projectId) {
      __typename
      ... on Project {
        version
        rootEntity
        domainSchema {
          entityImages {
            vid
            name
            entity {
              vid
              name
            }
            attributes {
              title
              name
              attrType
              unit
              description
              entity {
                vid
                name
              }
            }
          }
        }
      }
      ... on Error {
        code
        message
      }
    }
    __typename
  }
`;
