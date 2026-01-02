// Utility to handle Google Drive API interactions

declare var gapi: any;
declare var google: any;

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'hadirku_backup.json';

export interface DriveFile {
  id: string;
  name: string;
  createdTime?: string;
}

export const initGapiClient = async (apiKey: string, clientId: string, updateSigninStatus: (isSignedIn: boolean) => void) => {
  try {
    await new Promise<void>((resolve, reject) => {
      gapi.load('client', { callback: resolve, onerror: reject });
    });

    await gapi.client.init({
      apiKey: apiKey,
      discoveryDocs: [DISCOVERY_DOC],
    });

    // Initialize Token Client
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: '', // defined later
    });

    return tokenClient;
  } catch (error) {
    console.error("Error initializing GAPI client", error);
    throw error;
  }
};

export const handleAuthClick = (tokenClient: any, callback: (response: any) => void) => {
  tokenClient.callback = async (resp: any) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    callback(resp);
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({prompt: ''});
  }
};

export const listBackupFiles = async (): Promise<DriveFile[]> => {
  try {
    const response = await gapi.client.drive.files.list({
      'pageSize': 10,
      'fields': 'files(id, name, createdTime)',
      'q': `name = '${BACKUP_FILENAME}' and trashed = false`,
      'orderBy': 'createdTime desc'
    });
    return response.result.files;
  } catch (err) {
    console.error("Error listing files", err);
    throw err;
  }
};

export const uploadBackupFile = async (content: string) => {
  try {
    const file = new Blob([content], {type: 'application/json'});
    const metadata = {
      'name': BACKUP_FILENAME,
      'mimeType': 'application/json',
    };

    const accessToken = gapi.client.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form,
    });
    
    return await response.json();
  } catch (err) {
    console.error("Error uploading file", err);
    throw err;
  }
};

export const downloadBackupFile = async (fileId: string): Promise<any> => {
  try {
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    return response.result;
  } catch (err) {
     console.error("Error downloading file", err);
     throw err;
  }
}
