import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { VerifyEmailComponent } from "../shared/components/verify-email/verify-email.component";
import { PasswordRecoveryComponent } from "../auth/pages/password-recovery/password-recovery.component";
import { NoVerificationComponent } from "../shared/pages/no-verification/no-verification.component";
import { verificationGuard } from "../core/guards/verification.guard";
import { noVerificationGuard } from "../core/guards/no-verification.guard";


export default [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noVerificationGuard]
  },
  {
    path: 'email/verify',
    component: VerifyEmailComponent,
    canActivate: [verificationGuard]
  },
  {
    path: 'reset-password',
    component: PasswordRecoveryComponent,
    canActivate: [noVerificationGuard]
  },
  {
    path: 'no-verification',
    component: NoVerificationComponent,
    canActivate: [verificationGuard]
  }
] as Routes