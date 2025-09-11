
"use client"
import React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './input-otp';

export const OtpInput = ({
    value,
    onChange,
    numInputs = 6,
    isDisabled,
    ...props
}) => {
    return (
        <InputOTP maxLength={numInputs} value={value} onChange={onChange} {...props} disabled={isDisabled}>
            <InputOTPGroup className="w-full justify-between">
                {Array.from({ length: numInputs }).map((_, index) => (
                    <React.Fragment key={index}>
                        <InputOTPSlot index={index} />
                        {index < numInputs - 1 && numInputs > 4 && (index + 1) % 3 === 0 && <InputOTPSeparator />}
                    </React.Fragment>
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
};
