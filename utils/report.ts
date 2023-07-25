import { addressDetails } from "./auth";

export const statuses = [
  "Submitted",
  "ReadyForReview",
  "ReportFailed",
  "BidRequested",
];

export async function submittedReports({ request, baseURL }, token: string) {
  let reports = await request.get(
    `${baseURL}/api/Report/submitted-files?pageNumber=&pageSize=`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await reports.json();
}

export async function requestRepairs(
  { request, baseURL },
  token: string,
  fileId: number
) {
  let _responseRepairs = await request.get(
    `${baseURL}/api/Report/request-repairs?requestedReportId=${fileId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return await _responseRepairs.json();
}

export async function saveSelections(
  { request, baseURL },
  token: string,
  fileId: number,
  isChecked: boolean
) {
  let _responseRepairs = await requestRepairs(
    { request, baseURL },
    token,
    fileId
  );

  let selections = await request.post(`${baseURL}/api/Report/save-selections`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      requestedReportId: fileId,
      checkedRepairs: {
        [`${_responseRepairs[0].repairItems[0].id}`]: isChecked,
      },
    },
  });

  return await selections.text();
}

export async function submitReport(
  { request, baseURL },
  token: string,
  file: any,
  name: string
) {
  let _responseSubmit = await request.post(`${baseURL}/api/Report/v2/request`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    multipart: {
      file: {
        name: `./playwright/attachments/${name}.pdf`,
        mimeType: "application/octet-stream",
        buffer: file,
      },
      fname: "test",
      lname: "test",
      address1: String(addressDetails[2]).split(",")[0],
      city: "Annapolis",
      state: "MD",
      zip: 21401,
      longtitude: addressDetails[0],
      latitude: addressDetails[1],
    },
  });
  return await _responseSubmit.json();
}
