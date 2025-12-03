import Link from "next/link";
export default function Labs() {
    return (
        <div id="wd-labs">
            <h1>Labs</h1>
            <h4>Rishika Reddy Vootkur</h4>
            <h4>Section: CS5610 FA25</h4>
            <h4>
            Github-Client: <a href="https://github.com/RishikaVootkur/kambaz-next-js">https://github.com/RishikaVootkur/kambaz-next-js</a>
            </h4>
            <h4>
            Github-Server: <a href="https://github.com/RishikaVootkur/kambaz-node-server-app">https://github.com/RishikaVootkur/kambaz-node-server-app</a>
            </h4>
            <h5>
            Link to the root of the server: <a href="https://kambaz-node-server-app-qegw.onrender.com">https://kambaz-node-server-app-qegw.onrender.com</a>
            </h5>
            <ul>
                <li>
                    <Link href="/Labs/Lab1" id="wd-lab1-link">
                    Lab 1 : HTML Examples </Link>
                </li>
                <li>
                    <Link href="/Labs/Lab2" id="wd-lab2-link">
                    Lab 2 : CSS Basics </Link>
                </li>
                <li>
                    <Link href="/Labs/Lab3" id="wd-lab3-link">
                    Lab 3: JavaScript Fundamentals</Link>
                </li>
                <li>
                    <Link href="/Labs/Lab4" id="wd-lab4-link">
                    Lab 4: Maintaining State in React Applications</Link>
                </li>
                <li>
                    <Link href="/Labs/Lab5" id="wd-lab5-link">
                    Lab 5: Implementing RESTful Web APIs with Express.js</Link>
                </li>
                <li>
                    <Link href="/" id="wd-kambaz-link">
                    Kambaz </Link>
                </li>
            </ul>
        </div>
    );
}