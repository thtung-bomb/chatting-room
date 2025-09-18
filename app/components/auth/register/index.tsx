// pages/RegisterPage.tsx
import { auth } from "config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { setDoc, doc, collection } from "firebase/firestore"
import { saveUserToDB } from "util/db";


export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			alert("Mật khẩu không khớp!");
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
				alert("Đăng ký thành công!");
				saveUserToDB(user.user);
				navigate("/chat"); // redirect sau khi đăng ký
			}
		} catch (err: any) {
			alert("Đăng ký thất bại: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="">
			<Card className="w-full max-w-md p-8 space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-foreground font-[Space_Grotesk]">Register</h1>
					<p className="text-muted-foreground">Please enter your information to access your account</p>
				</div>
				<form onSubmit={handleRegister} className="space-y-4">
					<Label htmlFor="displayName">Your Name</Label>
					<Input type="text" id="displayName" placeholder="Your name" />
					<Label htmlFor="email">Email</Label>
					<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
					<Label htmlFor="password">Password</Label>
					<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
					<Button type="submit" className="w-full hover:bg-secondary/90 hover:text-black cursor-pointer" disabled={isLoading}>{isLoading ? "Registering..." : "Register"}</Button>
				</form>
				<div className="text-center text-gray-700">
					<Link to="/login">Already have an account? Sign in</Link>
				</div>
			</Card>
		</div>
	);
}
