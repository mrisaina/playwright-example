import { faker } from "@faker-js/faker";
import { test, expect, APIResponse } from "@playwright/test";
import { defaultEmail, login } from "../../playwright/auth";
import { saveSelections, submittedReports } from "../../playwright/report";

test.describe("share report with all items", async () => {
  let _responseReports: any;
  let _responseShare: APIResponse;
  let _responseJson: any;
  let _responseShareText: any;

  test.beforeAll(async ({ request, baseURL }) => {
    _responseJson = await login({ request, baseURL });
    _responseReports = await submittedReports(
      { request, baseURL },
      _responseJson.accessToken
    );

    const file = _responseReports.data.find(
      (file) => file.status == "ReadyForReview"
    );

    _responseShare = await request.post(`${baseURL}/api/Report/share-report`, {
      headers: {
        Authorization: `Bearer ${_responseJson.accessToken}`,
      },
      data: {
        requestedReportId: `${file.requestId}`,
        shareOnlySelected: false,
        receiverEmail: `${faker.name.firstName()}@mailto.plus`,
        agentFirstName: `${faker.name.firstName()}`,
        agentLastName: `${faker.name.lastName()}`,
        agentPhone: `${faker.phone.number("(222) ###-####")}`,
      },
    });

    _responseShareText = await _responseShare.text();
  });

  test("status should equal 200", async () => {
    expect(_responseShare.status()).toBe(200);
  });

  test("response body should be string", async () => {
    expect(typeof _responseShareText).toBe("string");
  });

  test("check response headers", async () => {
    const headers = _responseShare.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(headers["content-type"]).toContain("application/json");
  });

  test("response contains true value", async () => {
    expect(_responseShareText == "true").toBeTruthy();
  });
});

test.describe("cannot share report with not selected items via only selected option", async () => {
  let _responseReports: any;
  let _responseShare: APIResponse;
  let _responseJson: any;
  let _responseShareText: any;

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
      false
    );

    _responseShare = await request.post(`${baseURL}/api/Report/share-report`, {
      headers: {
        Authorization: `Bearer ${_responseJson.accessToken}`,
      },
      data: {
        requestedReportId: `${file.requestId}`,
        shareOnlySelected: true,
        receiverEmail: `${faker.name.firstName()}@mailto.plus`,
        agentFirstName: `${faker.name.firstName()}`,
        agentLastName: `${faker.name.lastName()}`,
        agentPhone: `${faker.phone.number("(222) ###-####")}`,
      },
    });

    _responseShareText = await _responseShare.text();
  });

  test("status should equal 400", async () => {
    expect(_responseShare.status()).toBe(400);
  });

  test("response body should be string", async () => {
    expect(typeof _responseShareText).toBe("string");
  });

  test("check response headers", async () => {
    const headers = _responseShare.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(headers["content-type"]).toContain("text/plain");
  });

  test("response contains text", async () => {
    expect(_responseShareText).toEqual(
      "You don't have any selections to share."
    );
  });
});

test.describe("share report with only selected items", async () => {
  let _responseReports: any;
  let _responseShare: APIResponse;
  let _responseJson: any;
  let _responseShareText: any;

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

    _responseShare = await request.post(`${baseURL}/api/Report/share-report`, {
      headers: {
        Authorization: `Bearer ${_responseJson.accessToken}`,
      },
      data: {
        requestedReportId: `${file.requestId}`,
        shareOnlySelected: true,
        receiverEmail: `${faker.name.firstName()}@mailto.plus`,
        agentFirstName: `${faker.name.firstName()}`,
        agentLastName: `${faker.name.lastName()}`,
        agentPhone: `${faker.phone.number("(222) ###-####")}`,
      },
    });

    _responseShareText = await _responseShare.text();
  });

  test("status should equal 200", async () => {
    expect(_responseShare.status()).toBe(200);
  });

  test("response body should be string", async () => {
    expect(typeof _responseShareText).toBe("string");
  });

  test("check response headers", async () => {
    const headers = _responseShare.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(headers["content-type"]).toContain("application/json");
  });

  test("response contains true value", async () => {
    expect(_responseShareText == "true").toBeTruthy();
  });
});
