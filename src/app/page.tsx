import Link from "next/link";

export default function App() {
    return <>
        <h1>Hi there !</h1>
        <Link href={"/login"}>
            Login Now !
        </Link>
    </>
};
