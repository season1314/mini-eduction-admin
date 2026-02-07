"use client";
import { useActionState, useEffect, useState } from "react";
import { loginAction} from "./actions";
import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner";
import { Loader2 } from "lucide-react"



export default function LoginPage() {
    const router = useRouter();

    //service login
    const [state, formAction] = useActionState(loginAction, { code: -1, timestamp: 1 });

    //handle error
    const [error, setError] = useState<Record<string, string | undefined>>({
        email: "",
        password: ""
    });

    //handle pending

    const [isPending, setPending] = useState(false)

    //clear error info by input on blur
    const clearError = (e: React.FocusEvent<HTMLInputElement>) => {
        const fieldName = e.target.id;
        setError(prev => ({
            ...prev,
            [fieldName]: ""
        }));
    };

    //handle submit
    const handleLogin = () => {
        setPending(true)

        const emailInput = document.getElementById("email") as HTMLInputElement;
        const passwordInput = document.getElementById("password") as HTMLInputElement;
        const email = emailInput?.value.trim();
        const password = passwordInput?.value.trim();

        startTransition(() => {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);
            formAction(formData);
        });
    };

    useEffect(() => {
        //handle result
        if (state.code == 2 && state.error) { setError(state.error); setPending(false) }
        if (state.code == 1) { toast.error(state.message); setPending(false) }
        if (state.code == 0) {
            toast.success(state.message)
            setTimeout(() => {
                setPending(false)
                router.push(`/${state?.data?.schemaName}/dashboard`)
            }, 1000)
        }
    }, [state.timestamp]);


    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription className="wt-1">
                        Welcome to login Mini Education Admin system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldSet className="w-full max-w-xs">
                        <FieldGroup className="gap-2">
                            <Field className="gap-1">
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email" type="text" placeholder="Email is 'admin@startaii.com'" onFocus={clearError} className="mt-1" />
                                <FieldError className="h-[20px] w-full text-[12px] pl-2">{error?.email || " "}</FieldError>
                            </Field>
                            <Field className="gap-1">
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input id="password" type="password" placeholder="Password is 'startaii'" onFocus={clearError} className="mt-1" />
                                <FieldError className="h-[20px] w-full text-[12px] pl-2">{error?.password || " "}</FieldError>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="button" className="w-full" onClick={handleLogin} disabled={isPending}>
                        {isPending ? <Loader2 className="h-10 w-10 animate-spin text-primary text-white" /> : "Login"}
                    </Button>
                </CardFooter>
            </Card>
        </div >
    )
}