import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import { AzureBlobService } from "../../services/azure/AzureService";

import FirebaseService from "../../services/firebase/FireBaseService";

const AzureBlob = new AzureBlobService();

const FireBase = new FirebaseService();

export async function registerUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userData = await request.formData().catch((error) => {
      return null;
    });

    if (!userData) {
      return {
        jsonBody: {
          status: 400,
          message:
            "No Data Is Provided, Please Provide Data in FormData Format",
          data: null,
        },
      };
    }

    const fullName = userData.get("fullName");
    const displayName = userData.get("displayName");
    const phoneNumber = userData.get("phoneNumber")
      ? userData.get("phoneNumber")
      : null;
    const age = userData.get("age");
    const email = userData.get("email");
    const password = userData.get("password");

    if (
      displayName === null ||
      email === null ||
      password === null ||
      fullName === null
    ) {
      return {
        jsonBody: {
          status: 400,
          message: "All Fields Are Required",
        },
      };
    }

    const avatar = userData.get("avatar");

    if (!avatar) {
      return {
        jsonBody: {
          status: 400,
          message: "Avatar Is Required",
        },
      };
    }

    let avatarUrl: string;
    let coverImageUrl: string;

    for (const [key, value] of userData.entries()) {
      if (value instanceof Blob) {
        const blobName = `${displayName}-${key}-${Date.now()}-blob.jpg`;
        const blobArrayBuffer = await value.arrayBuffer();
        const blobUrl = await AzureBlob.uploadBlob(blobName, blobArrayBuffer);
        if (key === "avatar") {
          avatarUrl = blobUrl;
        }
        if (key === "coverImage") {
          coverImageUrl = blobUrl;
        }
      }
    }

    const user = {
      fullName: fullName.toString(),
      displayName: displayName.toString(),
      phoneNumber: phoneNumber ? phoneNumber.toString() : null,
      age: age ? Number(age) : null,
      email: email.toString(),
      password: password.toString(),
      photoURL: avatarUrl.toString(),
      coverImage: coverImageUrl ? coverImageUrl.toString() : null,
    };

    const createduser = await FireBase.registerUser(user);

    if (createduser instanceof Error) {
      return {
        jsonBody: {
          status: 401,
          message: "Firebase Error While Registering User",
          error: createduser.message,
        },
      };
    }

    return {
      jsonBody: {
        status: 200,
        message: "User Registered Successfully",
        data: createduser,
      },
    };
  } catch (error) {
    return {
      jsonBody: {
        status: 500,
        message: "Internal Server Error While Registering User",
        error: error.message,
      },
    };
  }
  /*-------------------------------------------------------*/
}

export async function loginUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userData = await request.formData().catch((error) => {
      return null;
    });

    if (!userData) {
      return {
        jsonBody: {
          status: 400,
          message:
            "No Data Is Provided, Please Provide Data in FormData Format",
          data: null,
        },
      };
    }

    const email = userData.get("email");
    const password = userData.get("password");

    if (
      email instanceof Error ||
      password instanceof Error ||
      !email ||
      !password
    ) {
      return {
        jsonBody: {
          status: 400,
          message: "Email and Password Are Required",
          data: null,
        },
      };
    }

    const user = {
      email: email.toString(),
      password: password.toString(),
    };

    const loginUser = await FireBase.loginUser(user);
    if (loginUser instanceof Error) {
      return {
        jsonBody: {
          status: 401,
          message: "Firebase Error While Logging In User",
          error: loginUser.message,
        },
      };
    }

    return {
      jsonBody: {
        status: 200,
        message: "User Logged In Successfully",
      },
    };
  } catch (error) {
    return {
      jsonBody: {
        status: 500,
        message: "Internal Server Error While Logging In User",
        error: error.message,
      },
    };
  }
}

export async function loginUserWithGoogle(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const loggedInWithGoogle = await FireBase.loginWithGoogle();
    if (loggedInWithGoogle instanceof Error) {
      return {
        jsonBody: {
          status: 401,
          message: "Firebase Error While Logging In User With Google",
          error: loggedInWithGoogle.message,
        },
      };
    }
    return {
      jsonBody: {
        status: 200,
        message: "User Logged In Successfully With Google",
      },
    };
  } catch (error) {
    return {
      jsonBody: {
        status: 500,
        message: "Internal Server Error While Logging In User With Google",
        error: error.message,
      },
    };
  }
}

export async function logoutUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      await FireBase.logoutUser();
      return {
        jsonBody: {
          status: 200,
          message: "User Logged Out Successfully",
        },
      };
    } catch (error) {
      return {
        jsonBody: {
          status: 500,
          message: "Internal Server Error While Logging Out User",
          error: error.message,
        },
      };
    }
  });
}

export async function changeCurrentPassword(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const userData = await request.formData().catch((error) => {
        return null;
      });

      if (!userData) {
        return {
          jsonBody: {
            status: 400,
            message:
              "No Data Is Provided, Please Provide Data in FormData Format",
            data: null,
          },
        };
      }

      const password = userData.get("password");

      const changedPassword = await FireBase.changeCurrentPassword(
        password.toString()
      );

      if (changedPassword instanceof Error) {
        return {
          jsonBody: {
            status: 401,
            message: "Firebase Error While Changing Password",
            error: changedPassword.message,
          },
        };
      }

      return {
        jsonBody: {
          status: 200,
          message: "Password Changed Successfully",
        },
      };
    } catch (error) {
      return {
        jsonBody: {
          status: 500,
          message: "Internal Server Error While Changing Password",
          error: error.message,
        },
      };
    }
  });
}

export async function sendEmailToChangeCurrentPassword(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userData = await request.formData().catch((error) => {
      return null;
    });

    if (!userData) {
      return {
        jsonBody: {
          status: 400,
          message:
            "No Data Is Provided, Please Provide Data in FormData Format",
          data: null,
        },
      };
    }

    const email = userData.get("email");

    if (email instanceof Error || !email) {
      return {
        jsonBody: {
          status: 400,
          message: "Email Is Required",
          data: null,
        },
      };
    }

    const changedPassword = await FireBase.sendResetPasswordEmail(
      email.toString()
    );

    if (changedPassword instanceof Error) {
      return {
        jsonBody: {
          status: 401,
          message: "Firebase Error While Sending Email",
          error: changedPassword.message,
        },
      };
    }

    return {
      jsonBody: {
        status: 200,
        message: "Email Sent Successfully",
      },
    };
  } catch (error) {
    return {
      jsonBody: {
        status: 500,
        message: "Internal Server Error While Sending Email",
        error: error.message,
      },
    };
  }
}

app.http("registerUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/registeruser",
  handler: registerUser,
});

app.http("loginUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/loginUser",
  handler: loginUser,
});

app.http("logoutUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/logoutUser",
  handler: logoutUser,
});

app.http("changeCurrentPassword", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/changeCurrentPassword",
  handler: changeCurrentPassword,
});

app.http("sendEmailToChangeCurrentPassword", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/sendEmailToChangeCurrentPassword",
  handler: sendEmailToChangeCurrentPassword,
});

/*----------------------------------------------*/

app.http("loginUserWithGoogle", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/loginUserWithGoogle",
  handler: loginUserWithGoogle,
});
