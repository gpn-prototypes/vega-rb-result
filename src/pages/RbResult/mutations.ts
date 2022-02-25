import { gql } from '@apollo/client';
import { ResourceBaseDiffFragment } from '@app/components/TableResultRbController/queries';

export const CALCULATION_PROJECT = gql`
  mutation calculateProject($version: Int!, $projectInput: RBProjectInput!) {
    project(version: $version) {
      ... on UpdateProjectInnerDiff {
        ...ResourceBaseDiffFragment
      }
      ... on ProjectMutation {
        resourceBase {
          calculateProject(projectInput: $projectInput) {
            ... on TableErrors {
              errors {
                code
                message
                row
                tableName
                columnKey
              }
            }
            ... on DetailError {
              code
              details
              message
            }
            ... on CalculationResult {
              resultId
            }
            ... on DistributionDefinitionErrors {
              errors {
                code
                message
                fields
              }
            }
          }
        }
      }
    }
    version
    __typename
  }
  ${ResourceBaseDiffFragment}
`;

export const GENERATE_CALCULATION_RESULT_ARCHIVE = gql`
  mutation generateCalculationResultArchive(
    $version: Int!
    $plots: Boolean
    $samples: Boolean
    $statistics: Boolean
  ) {
    project(version: $version) {
      ... on UpdateProjectInnerDiff {
        ...ResourceBaseDiffFragment
        __typename
      }
      ... on Error {
        code
        message
        details
        payload
      }
      ... on ProjectMutation {
        resourceBase {
          generateCalculationResultArchive(
            samples: $samples
            statistics: $statistics
            plots: $plots
          ) {
            ... on ProcessId {
              processId
              __typename
            }
            ... on CommonError {
              code
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    version
    __typename
  }
  ${ResourceBaseDiffFragment}
`;
