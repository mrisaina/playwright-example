import { test, expect, APIResponse } from "@playwright/test";
import { login } from "../../playwright/auth";
import { submittedReports } from "../../playwright/report";

test.describe("get repairs from file", async () => {
  let _responseReports: any;
  let _responseRepairs: APIResponse;
  let _responseJson: any;
  let _responseRepairsJson: any;
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
    _responseRepairs = await request.get(
      `${baseURL}/api/Report/request-repairs?requestedReportId=${file.requestId}`,
      {
        headers: {
          Authorization: `Bearer ${_responseJson.accessToken}`,
        },
      }
    );
    end = new Date();
    _responseRepairsJson = await _responseRepairs.json();
  });

  test("response time should be less than 5000s", async () => {
    expect(end - start).toBeLessThan(5000);
  });

  test("status should equal 200", async () => {
    expect(_responseRepairs.status()).toBe(200);
  });

  test("response body should be an object", async () => {
    expect(typeof _responseRepairsJson).toBe("object");
  });

  test("check response headers", async () => {
    const headers = _responseRepairs.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(headers["content-type"]).toContain("application/json");
  });

  test("check the response props", async () => {
    _responseRepairsJson.forEach((file) => {
      const props = Object.keys(file);
      expect(props).toContain("serviceCategory");
      expect(props).toContain("minimumPrice");
      expect(props).toContain("repairItems");

      file.repairItems.forEach((item) => {
        const props = Object.keys(item);

        expect(props).toContain("id");
        expect(props).toContain("transactID");
        expect(props).toContain("repair");
        expect(props).toContain("page");
        expect(props).toContain("code");
        expect(props).toContain("contractor");
        expect(props).toContain("itemCode");
        expect(props).toContain("item");
        expect(props).toContain("action");
        expect(props).toContain("dPrice");
        expect(props).toContain("images");
        expect(props).toContain("isChecked");
        expect(props).toContain("taxonomy");
      });
    });
  });
});
