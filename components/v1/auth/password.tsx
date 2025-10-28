import React from 'react'
import AuthLayout from './auth-layout'
import PasswordForm from './password-form'

const password = () => {
  return (
    <AuthLayout title='Reset Password' subTitle='Set a new password to secure your account!'>
      <PasswordForm/>
    </AuthLayout>
  )
}

export default password

