// pages/RegisterPage.tsx
import { auth } from "config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { saveUserToDB } from "util/db";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";


export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Passwords do not match!", { position: 'top-center', richColors: true });
			return;
		}

		setIsLoading(true);
		try {
			// await register(email, password);
			const user = await createUserWithEmailAndPassword(auth, email, password);
			console.log('====================================');
			console.log('User registered successfully', user);
			console.log('====================================');
			if (user) {
				toast.success("Registration successful!", { position: 'top-center', richColors: true });
				saveUserToDB(user.user);
				navigate("/chat"); // redirect after registration
			}
		} catch (err: any) {
			toast.error("Registration failed: " + err.message, { position: 'top-center', richColors: true });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="">
			<Card className="w-full max-w-md px-8 space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-foreground font-[Space_Grotesk]">Register</h1>
					<p className="text-muted-foreground">Please enter your information to create your account</p>
				</div>
				<form onSubmit={handleRegister} className="space-y-4">
					<Label htmlFor="email">Email</Label>
					<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
					<Label htmlFor="password">Password</Label>
					<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
					<Button type="submit" className="w-full hover:bg-secondary/90 hover:text-black cursor-pointer" disabled={isLoading}>{isLoading ? "Registering..." : "Register"}</Button>
				</form>
				<div className="text-center text-gray-700 hover:underline">
					<Link to="/login">Already have an account? Sign in</Link>
				</div>
			</Card>
		</div>
	);
}
