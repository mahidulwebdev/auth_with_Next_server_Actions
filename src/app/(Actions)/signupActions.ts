"use server";
import { ConnectDb } from "@/lib/db/dbConnection";
import UserModel from "@/lib/db/schema/userSchema";
import { User } from "@/lib/Validation/zod";
import * as z from "zod/v4";

interface returnTyp {
  success: boolean;
  userName?: string | string[];
  email?: string | string[];
  password?: string | string[];
  signupErr?: string;
  signup?: string;
}

export async function SignupAction(state: returnTyp, formData: FormData) {
  try {
    await ConnectDb();

    // ---> handle validation
    const userData = Object.fromEntries(formData);
    const { error, data } = User.safeParse(userData);
    if (error) {
      const flattened = error ? z.flattenError(error).fieldErrors : {};

      if (flattened?.email) {
        return { ...flattened, success: false };
      } else if (flattened?.password) {
        return { password: flattened.password, success: false };
      }
      return { userName: flattened.userName, success: false };
    }

    // --> db operation
    const findUser = await UserModel.findOne({ email: data?.email });
    if (findUser) {
      return { email: "This email is already registered", success: false };
    }

    const user = new UserModel(data);
    await user.save();
    if (!user) {
      return { signupErr: "An error occurred during signup", success: false };
    }

    return { signup: "Successfully signed up", success: true };
  } catch (error) {
    console.log(error);
    return { signupErr: "Something went wrong", success: false };
  }
}
