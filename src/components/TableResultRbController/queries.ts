import { gql } from '@apollo/client';

export const GET_PROJECT_NAME = gql`
  query ProjectName($vid: UUID) {
    project(vid: $vid) {
      __typename
      ... on Project {
        vid
        version
        name
      }
      ... on Error {
        code
      }
    }
  }
`;

export const GET_VERSION = gql`
  query ProjectVersion($vid: UUID) {
    project(vid: $vid) {
      __typename
      ... on Project {
        vid
        version
      }
      ... on Error {
        code
      }
    }
  }
`;

export const ResourceBaseTableFragment = gql`
  fragment ResourceBaseTableFragment on RBProject {
    version
    conceptions {
      name
      probability
      description
      structure {
        domainObjects {
          vid
          domainObjectPath {
            code
            value
          }
          geoObjectCategory
          risksValues {
            code
            value
          }
          attributeValues {
            distribution {
              type
              definition
              parameters {
                type
                value
              }
              minBound
              maxBound
            }
            code
            visibleValue {
              ... on VisibleValue {
                value
              }
            }
          }
        }
        domainEntities {
          name
          code
          icon
          visible {
            calc
            table
            tree
          }
        }
        risks {
          code
          name
        }
        attributes {
          code
          name
          shortName
          units
          decimalPlace
        }
      }
    }
  }
`;

export const ResourceBaseProjectFragment = gql`
  ${ResourceBaseTableFragment}

  fragment ResourceBaseProjectFragment on ProjectInner {
    vid
    version
    resourceBase {
      project {
        loadFromDatabase {
          ...ResourceBaseTableFragment
        }
      }
    }
  }
`;

export const ResourceBaseDiffFragment = gql`
  ${ResourceBaseProjectFragment}

  fragment ResourceBaseDiffFragment on UpdateProjectInnerDiff {
    remoteProject {
      ... on ProjectInner {
        ...ResourceBaseProjectFragment
      }
    }
  }
`;

export const LOAD_PROJECT = gql`
  query ProjectResourceBase {
    project {
      ...ResourceBaseProjectFragment
    }
    version
    __typename
  }

  ${ResourceBaseProjectFragment}
`;

export const GET_TABLE_TEMPLATE = gql`
  query GetTemplate {
    project {
      vid
      version
      resourceBase {
        project {
          template {
            ...ResourceBaseTableFragment
          }
        }
      }
    }
  }

  ${ResourceBaseTableFragment}
`;

export const GET_HISTOGRAM_RESULT_RB = gql`
  query GetTableResultRb($projectId: ID!, $domainEntityCodes: [ID!], $domainEntityNames: [String!]) {
    project {
      rbResult {
        histograms{
          getHistograms(projectId: $projectId, domainEntityCodes: $domainEntityCodes, domainEntityNames: $domainEntityNames){
            histograms{
              title
              subtitle
              percentiles
              sample
              numberOfIterationBin
            }
          }
        }
      }
    }
  }
`;

export const GET_SENSITIVE_ANALYSIS_RESULT_RB = gql`
  query GetTableResultRb($projectId: ID!, $domainEntityNames: [String!]) {
    project {
      rbResult {
        histograms{
          getSensitivityAnalysis(projectId: $projectId, domainEntityNames: $domainEntityNames) {
            title
            names
            sample
            percentiles
            zeroPoint
          }
        }
      }
    }
  }
`;

export const GET_TABLE_RESULT_RB = gql`
  query GetTableResultRb {
    project {
      rbResult {
        result{
          template(projectId: "project_id") {
            domainEntities{
              code
              name
              visible{
                calc
                table
                tree
              }
            }
            attributes{
              code
              name
              shortName
              units
              visible{
                calc
                table
                tree
              }
            }
            domainObjects{
              parents{
                code
                name
                isTotal
              }
              attributeValues{
                code
                percentiles
                values
              }
            }
          }
        }
      }
    }
  }
`;
