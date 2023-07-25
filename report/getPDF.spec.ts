import { test, expect, APIResponse } from "@playwright/test";
import { login } from "../../playwright/auth";
import { submittedReports } from "../../playwright/report";

test.describe("get pdf", async () => {
  let _responseReports: any;
  let _responsePDF: APIResponse;
  let _responseJson: any;
  let start: any;
  let end: any;

  test.beforeAll(async ({ request, baseURL }) => {
    _responseJson = await login({ request, baseURL });
    _responseReports = await submittedReports(
      { request, baseURL },
      _responseJson.accessToken
    );

    const file = _responseReports.data.find(
      (file) => file.status == "ReadyForReview"
    );

    start = new Date();
    _responsePDF = await request.get(
      `${baseURL}/api/Report/download-punch-pdf?reportId=${file.requestId}`,
      {
        headers: {
          Authorization: `Bearer ${_responseJson.accessToken}`,
        },
      }
    );
    end = new Date();
  });

  test("response time should be less than 5000s", async () => {
    expect(end - start).toBeLessThan(5000);
  });

  test("status should equal 200", async () => {
    expect(_responsePDF.status()).toBe(200);
  });

  test("check response headers", async () => {
    const headers = _responsePDF.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(Object.keys(headers)).toContain("content-disposition");
    expect(headers["content-type"]).toContain("application/pdf");
    expect(headers["content-disposition"]).toContain(
      "attachment; filename=inspectionReport.pdf"
    );
  });
});
