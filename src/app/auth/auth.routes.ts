import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { VerifyEmailComponent } from "../shared/components/verify-email/verify-email.component";
import { PasswordRecoveryComponent } from "../auth/pages/password-recovery/password-recovery.component";


export default [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'email/verify',
    component: VerifyEmailComponent
  },
  {
    path: 'reset-password',
    component: PasswordRecoveryComponent
  }
] as Routes