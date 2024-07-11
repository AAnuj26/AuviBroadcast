import { initializeApp, FirebaseApp, FirebaseOptions } from "firebase/app";

import {
  Auth,
  getAuth,
  createUserWithEmailAndPassword,
  UserCredential,
  User,
  updateProfile,
  signInWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
  signInWithRedirect,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import admin from "firebase-admin";

import { getDatabase, Database, ref, set, get, child } from "firebase/database";

import { AzureKeyVaultService } from "../azure/AzureService";

const AzureKeyVault: AzureKeyVaultService = new AzureKeyVaultService();

interface UserSchema {
  fullName: string;
  displayName: string;
  phoneNumber?: string;
  age?: number;
  email: string;
  password: string;
  photoURL: string;
  coverImage?: string;
}

interface UserObject extends UserSchema {
  uid: string;
  createdAt: string;
  updatedAt: string;
  watchHistory: string[] | boolean;
}

class FirebaseService {
  private myFirebaseApp: FirebaseApp;
  private auth: Auth;
  private database: Database;
  private admin = admin;

  constructor() {
    this.initialize();
  }

  public async initialize(): Promise<void | Error> {
    try {
      const firebaseConfig: FirebaseOptions =
        await AzureKeyVault.getFireBaseValues();
      this.myFirebaseApp = initializeApp(firebaseConfig);
      this.auth = getAuth(this.myFirebaseApp);
      this.database = getDatabase(this.myFirebaseApp);
      this.admin.initializeApp(firebaseConfig);
      return;
    } catch (error) {
      return error;
    }
  }

  public async authenticator(
    request: HttpRequest,
    context: InvocationContext,
    next: () => Promise<HttpResponseInit>
  ): Promise<HttpResponseInit> {
    try {
      let currentUserToken: string;
      try {
        currentUserToken = await this.auth.currentUser
          .getIdToken(/* forceRefresh true*/)
          .then((idToken) => {
            // console.log("Token from auth : \n", idToken);
            return idToken;
          });
      } catch (error) {
        return new Response(401, "Unauthorized Request : No User Found", error);
      }
      // let isValid: any;
      try {
        const isValid = await this.admin
          .auth()
          .verifyIdToken(currentUserToken)
          .then((decodedToken) => {
            // console.log("Decoded Token : \n", decodedToken);
            return decodedToken;
          });
      } catch (error) {
        return new Response(403, "Unauthorized Request : Invalid Token", error);
      }

      // console.log("isValid : ", isValid);

      return await next();

      // if (isValid) {
      //   return await next();
      // }
    } catch (error) {
      return new Response(500, "FireBase Error While Authorizing ", error);
    }
  }

  public async registerUser(userData: UserSchema): Promise<UserObject | Error> {
    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(
          this.auth,
          userData.email,
          userData.password
        );

      await updateProfile(userCredential.user, {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      });

      const user: User = this.auth.currentUser;

      const createUser: UserObject = {
        uid: user.uid,
        fullName: userData.fullName,
        displayName: user.displayName,
        email: user.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber ? userData.phoneNumber : null,
        age: userData.age ? userData.age : null,
        photoURL: userData.photoURL,
        coverImage: userData.coverImage ? userData.coverImage : null,
        watchHistory: null,
        createdAt: user.metadata.creationTime,
        updatedAt: user.metadata.lastSignInTime,
      };

      await set(ref(this.database, `users/${user.uid}`), createUser);

      return createUser;
    } catch (error) {
      return error;
    }
  }

  public async loginUser(user: {
    email: string;
    password: string;
  }): Promise<User | Error> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        user.email,
        user.password
      );

      return userCredential.user;
    } catch (error) {
      return error;
    }
  }

  public async loginWithGoogle(): Promise<User | Error> {
    try {
      const provider = new GoogleAuthProvider();

      const userCredential: UserCredential = await signInWithRedirect(
        this.auth,
        provider
      );
      return userCredential.user;
    } catch (error) {
      return error;
    }
  }

  public async logoutUser(): Promise<boolean | Error> {
    try {
      if (this.auth.currentUser) {
        await this.auth.signOut();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return error;
    }
  }

  // public async changeCurrentPassword(
  //   newPassword: string
  // ): Promise<boolean | Error> {
  //   try {
  //     await updatePassword(this.auth.currentUser, newPassword);
  //     return true;
  //   } catch (error) {
  //     return error;
  //   }
  // }

  public async resetPassword(email: string): Promise<boolean | Error> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error) {
      return error;
    }
  }

  public async deleteUser(uid: string): Promise<boolean | Error> {
    try {
      await this.auth.currentUser.delete();
      await set(ref(this.database, `users/${uid}`), null);
      return true;
    } catch (error) {
      return error;
    }
  }
  public async getCurrentUser(): Promise<any> {
    return this.auth.currentUser;

    // return await get(child(ref(this.database), `users/${user.uid}`))
    //   .then((snapshot) => {
    //     if (snapshot.exists()) {
    //       return snapshot.val();
    //     }
    //   })
    //   .catch((error) => {
    //     return error;
    //   });
  }
}

export default FirebaseService;
