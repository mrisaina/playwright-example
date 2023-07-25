import { faker } from "@faker-js/faker";
import { test, expect, APIResponse } from "@playwright/test";
import { defaultEmail, login } from "../utils/auth";
import {
  requestRepairs,
  saveSelections,
  submittedReports,
} from "../utils/report";

test.describe("get file statuses", async () => {
  let _responseProposal: APIResponse;
  let _responseReports:  APIResponse;
  let _responseJson: object;
  let _responseProposalJson: object;
  let start: number;
  let end: number;

  test.beforeAll(async ({ request, baseURL }) => {
    _responseJson = await login({ request, baseURL });
    _responseReports = await submittedReports(
      { request, baseURL },
      _responseJson.accessToken
    );

    const file = _responseReports.data.find(
      (file) => file.status == "ReadyForReview"
    );

    await saveSelections(
      { request, baseURL },
      _responseJson.accessToken,
      file.requestId,
      true
    );

    const _responseRepairsJson = await requestRepairs(
      { request, baseURL },
      _responseJson.accessToken,
      file.requestId
    );

    const checkedStatus: {} = {};
    _responseRepairsJson?.map((item) =>
      item.repairItems.map((childItem: any) => {
        checkedStatus[childItem.id] = childItem.isChecked;
      })
    );

    start = new Date();
    _responseProposal = await request.post(
      `${baseURL}/api/Report/request-proposal`,
      {
        headers: {
          Authorization: `Bearer ${_responseJson.accessToken}`,
        },
        data: {
          requestedReportId: file.requestId,
          checkedRepairs: checkedStatus,
          owner1FirstName: "dolor cupidatat sint eiusmod in",
          owner1LastName: "culpa nisi",
          owner1Email: "test@test.com",
          owner1Phone: "(222) 222-2222",
          owner2FirstName: "culpa ex in nulla",
          owner2LastName: "quis id nostrud Lorem",
          owner2Email: "test@test.com",
          owner2Phone: "(222) 222-2222",
          agentPhoneNumber: "(222) 222-2223",
          moreThenTwoContacts: true,
          brokerage: "des",
          requestedReportRequestingProposalUserType: "BuyerAgent",
        },
      }
    );
    end = new Date();

    _responseProposalJson = await _responseProposal.json();
  });

  test("response time should be less than 8000s", async () => {
    expect(end - start).toBeLessThan(8000);
  });

  test("status should equal 200", async () => {
    expect(_responseProposal.status()).toBe(200);
  });

  test("response body should be an object", async () => {
    expect(typeof _responseProposalJson).toBe("object");
  });

  test("check response headers", async () => {
    const headers = _responseProposal.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(headers["content-type"]).toContain("application/json");
  });
});
