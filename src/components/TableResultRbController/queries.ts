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
  query GetTableResultRb($domainEntityNames: [String!], $bins: Int) {
    project {
      resourceBase {
        result {
          histograms {
            getHistograms(domainEntityNames: $domainEntityNames, bins: $bins) {
              histograms {
                title
                subtitle
                percentiles
                sample
                numberOfIterationBin
                cdf
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_SENSITIVE_ANALYSIS_RESULT_RB = gql`
  query GetTableResultRb($domainEntityNames: [String!]) {
    project {
      resourceBase {
        result {
          histograms {
            getSensitivityAnalysis(domainEntityNames: $domainEntityNames) {
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
  }
`;

export const GET_SENSITIVE_ANALYSIS_STATISTIC_RESULT_RB = gql`
  query GetTableResultRb($domainEntityNames: [String!]) {
    project {
      resourceBase {
        result {
          histograms {
            getSensitivityAnalysis(domainEntityNames: $domainEntityNames) {
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
  }
`;

export const GET_TABLE_RESULT_RB = gql`
  query GetTableResultRb {
    project {
      resourceBase {
        result {
          resultTable {
            template {
              domainEntities {
                code
                name
                visible {
                  calc
                  table
                  tree
                }
              }
              attributes {
                code
                name
                shortName
                units
                geoType
                decimal
                visible {
                  calc
                  table
                  tree
                }
                viewType
              }
              domainObjects {
                parents {
                  code
                  name
                  isTotal
                }
                attributeValues {
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
  }
`;
