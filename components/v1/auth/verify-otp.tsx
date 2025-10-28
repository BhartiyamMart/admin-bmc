import React from 'react'
import AuthLayout from './auth-layout'
import VerifyOtpForm from './verify-otp-form'

const VerifyOtp = () => {
  return (
    <AuthLayout title='Verify Otp' subTitle='Verify the 6-digit code sent to your registered email.'>
     <VerifyOtpForm/>
    </AuthLayout>
  )
}

export default VerifyOtp;


