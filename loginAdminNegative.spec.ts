import { test, expect } from "@playwright/test";

test.describe.parallel("admin login with invalid data", () => {
  const dataLogin = [
    ["", ""],
    ["test", "password"],
    ["email@", "password"],
    [`${"test".repeat(20)}`, `${"test".repeat(20)}`],
  ];

  dataLogin.forEach((el, i) => {
    let _response: any;
    let _responseJson: any;
    let headers: object;
    let start: any;
    let end: any;

    test.beforeEach(async ({ request, baseURL }) => {
      start = new Date();
      _response = await request.post(`${baseURL}/api/auth/login-admin`, {
        data: {
          email: el[0],
          password: el[1],
        },
      });
      end = new Date();

      _responseJson = await _response.json().catch(() => {
        return null;
      });
      headers = _response.headers();
    });

    test(`response time should be less than 5000s [${i}]`, async () => {
      expect(end - start).toBeLessThan(5000);
    });

    test(`status should equal 400 [${i}]`, async () => {
      expect(_response.status()).toBe(400);
    });

    if (el[0] === "" && el[1] === "") {
      test(`check content-type [${i}]`, async () => {
        expect(Object.keys(headers)).toContain("content-type");
        expect(headers["content-type"]).toContain("application/problem+json");
      });

      test("check validation message", async () => {
        expect(_responseJson.errors.Email).toEqual(["Field required"]);
        expect(_responseJson.errors.Password).toEqual(["Field required"]);
      });
    } else {
      test(`check content-type [${i}]`, async () => {
        expect(Object.keys(headers)).toContain("content-type");
        expect(headers["content-type"]).toContain("text/plain");
      });

      test(`check response message [${i}]`, async () => {
        _response.text().then((el) => {
          expect(el).toContain("Incorrect login or password");
        });
      });
    }
  });
});
