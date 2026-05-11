@description('The location of the resources.')
param location string = resourceGroup().location

@description('The base name for resources')
param baseName string = 'fullshot${uniqueString(resourceGroup().id)}'

@description('The administrator username for the PostgreSQL server.')
param dbAdminUsername string = 'dbadmin'

@description('The administrator password for the PostgreSQL server.')
@secure()
param dbAdminPassword string

// 1. Application Insights (Optimization: Monitoring & Operations)
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${baseName}-la'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${baseName}-appinsights'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

// 2. Azure Key Vault (Optimization: Security & DevOps)
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: '${baseName}-kv'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: [] // Using RBAC instead
    enableRbacAuthorization: true
  }
}

resource dbPasswordSecret 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  parent: keyVault
  name: 'DbAdminPassword'
  properties: {
    value: dbAdminPassword
  }
}

// 3. PostgreSQL Database (Data Resource)
// Note: We use PostgreSQL Flexible Server because it's recommended for new apps.
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: '${baseName}-pg'
  location: location
  sku: {
    name: 'Standard_B1ms' // Burstable tier, cost effective
    tier: 'Burstable'
  }
  properties: {
    version: '14'
    administratorLogin: dbAdminUsername
    administratorLoginPassword: dbAdminPassword
    storage: {
      storageSizeGB: 32
    }
  }
}

// Allow Azure services to access PostgreSQL
resource postgresFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAllAzureServicesAndResourcesWithinIG'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// 4. App Service Plan (Core Compute)
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${baseName}-asp'
  location: location
  sku: {
    name: 'S1' // Standard tier is required for Autoscale rules
    capacity: 1 
  }
  properties: {
    reserved: true // Required for Linux
  }
}

// 5. Autoscale Setting (Optimization: Scalability)
resource autoscaleSetting 'Microsoft.Insights/autoscalesettings@2022-10-01' = {
  name: '${baseName}-autoscale'
  location: location
  properties: {
    targetResourceUri: appServicePlan.id
    enabled: true
    profiles: [
      {
        name: 'Auto created scale condition'
        capacity: {
          minimum: '1'
          maximum: '3'
          default: '1'
        }
        rules: [
          {
            metricTrigger: {
              metricName: 'CpuPercentage'
              metricResourceUri: appServicePlan.id
              timeGrain: 'PT1M'
              statistic: 'Average'
              timeWindow: 'PT5M'
              timeAggregation: 'Average'
              operator: 'GreaterThan'
              threshold: 70
            }
            scaleAction: {
              direction: 'Increase'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT10M'
            }
          }
          {
            metricTrigger: {
              metricName: 'CpuPercentage'
              metricResourceUri: appServicePlan.id
              timeGrain: 'PT1M'
              statistic: 'Average'
              timeWindow: 'PT5M'
              timeAggregation: 'Average'
              operator: 'LessThan'
              threshold: 30
            }
            scaleAction: {
              direction: 'Decrease'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT10M'
            }
          }
        ]
      }
    ]
  }
}

// 6. App Service (Web App)
resource appService 'Microsoft.Web/sites@2022-09-01' = {
  name: '${baseName}-app'
  location: location
  identity: {
    type: 'SystemAssigned' // Generates a Managed Identity for secure access to Key Vault
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: applicationInsights.properties.InstrumentationKey
        }
        {
          name: 'DB_HOST'
          value: postgresServer.properties.fullyQualifiedDomainName
        }
        {
          name: 'DB_USER'
          value: dbAdminUsername
        }
        {
          // Key Vault Reference! The App Service fetches this automatically at runtime.
          name: 'DB_PASS'
          value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=${dbPasswordSecret.name})'
        }
      ]
    }
  }
}

// 7. Role Assignment (Allows App Service Managed Identity to read Key Vault secrets)
var keyVaultSecretsUserRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')

resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01-preview' = {
  name: guid(keyVault.id, appService.id, keyVaultSecretsUserRoleDefinitionId)
  scope: keyVault
  properties: {
    roleDefinitionId: keyVaultSecretsUserRoleDefinitionId
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

output webAppUrl string = appService.properties.defaultHostName
