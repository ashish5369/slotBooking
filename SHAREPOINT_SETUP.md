# SharePoint Excel Integration Setup Guide

## Prerequisites

1. SharePoint Online subscription
2. Azure AD App Registration
3. Excel file in SharePoint with proper structure

## Step 1: Create Excel File in SharePoint

Create an Excel file in your SharePoint site with the following column structure:

| SlotID   | Date       | StartTime | EndTime | Status    | BookedName | BookedEmail |
| -------- | ---------- | --------- | ------- | --------- | ---------- | ----------- |
| slot-001 | 2025-09-08 | 09:00     | 10:00   | Available |            |             |
| slot-002 | 2025-09-08 | 11:00     | 12:00   | Available |            |             |

## Step 2: Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - Name: `Slot Booking API`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: Leave blank for now
5. Click **Register**

## Step 3: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Add the following permissions:
   - `Files.ReadWrite.All`
   - `Sites.ReadWrite.All`
6. Click **Grant admin consent**

## Step 4: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description and set expiration
4. Copy the **Value** (this is your CLIENT_SECRET)

## Step 5: Get Required IDs

### Get Tenant ID

- From Azure AD overview page, copy the **Tenant ID**

### Get Site ID

```bash
GET https://graph.microsoft.com/v1.0/sites/{hostname}:{site-path}
```

Example:

```bash
GET https://graph.microsoft.com/v1.0/sites/yourdomain.sharepoint.com:/sites/yoursite
```

### Get Drive ID

```bash
GET https://graph.microsoft.com/v1.0/sites/{site-id}/drives
```

### Get File ID

```bash
GET https://graph.microsoft.com/v1.0/drives/{drive-id}/root/children
```

Or search for specific file:

```bash
GET https://graph.microsoft.com/v1.0/drives/{drive-id}/root/search(q='filename.xlsx')
```

## Step 6: Update Environment Variables

Update your `.env` file with the collected information:

```env
# Microsoft Graph API Configuration
CLIENT_ID=your_app_client_id
CLIENT_SECRET=your_app_client_secret
TENANT_ID=your_tenant_id

# SharePoint Configuration
SHAREPOINT_SITE_ID=your_sharepoint_site_id
SHAREPOINT_DRIVE_ID=your_sharepoint_drive_id
EXCEL_FILE_ID=your_excel_file_id
WORKSHEET_NAME=Sheet1

# Server Configuration
PORT=5000
```

## Step 7: Test the Integration

1. Start your backend server:

   ```bash
   npm start
   ```

2. Test the API endpoints:

   ```bash
   # Get all slots
   curl http://localhost:5000/api/slots

   # Book a slot
   curl -X POST http://localhost:5000/api/slots/book \
     -H "Content-Type: application/json" \
     -d '{"slotId":"slot-001","name":"John Doe","email":"john@example.com"}'
   ```

## Troubleshooting

### Common Issues:

1. **Authentication Error**: Check CLIENT_ID, CLIENT_SECRET, and TENANT_ID
2. **File Not Found**: Verify EXCEL_FILE_ID and WORKSHEET_NAME
3. **Permission Denied**: Ensure proper API permissions are granted
4. **Excel Format Error**: Verify column structure matches expected format

### Testing Authentication:

```javascript
// Test in Node.js console
const SharePointService = require("./services/sharepointService");
const service = new SharePointService();
service.authenticate().then((result) => console.log("Auth result:", result));
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use Azure Key Vault** for production secrets
3. **Implement proper error handling**
4. **Monitor API usage** and set up alerts
5. **Regularly rotate client secrets**

## Production Considerations

1. **Implement caching** to reduce API calls
2. **Add retry logic** for failed requests
3. **Set up monitoring** and logging
4. **Use connection pooling** if needed
5. **Implement rate limiting** on your API endpoints
