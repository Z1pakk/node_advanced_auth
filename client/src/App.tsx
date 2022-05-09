import React, { useContext, useEffect, useState } from 'react';
import LoginForm from "./components/LoginForm";
import { Context } from "./index";
import { observer } from 'mobx-react-lite'
import { IUser } from "./models/IUser";
import { createDeflateRaw } from "zlib";
import UserService from "./services/UserService";

function App() {
    const {store} = useContext(Context);
    const [users, setUsers] = useState<IUser[]>([]);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            store.checkAuth();
        }
    }, [])

    async function getUsers() {
        try {
            const response = await UserService.fetchUsers();
            setUsers(response.data);
        } catch (e) {
            console.log(e)
        }
    }

    if (store.isLoading) {
        return <div>Loading...</div>
    }

    if (!store.isAuth) {
        return (
            <LoginForm />
        )
    }

  return (
    <div className="App">
        <h1>{store.isAuth ? `You are authorized as ${store.user.email}` : "You are not authorized"}</h1>
        <h2>{store.user.isActivated ? 'Your account is activated' : 'Your account is not activated. Activate it by email.'}</h2>
        <button onClick={() => store.logout()}>Log out</button>
        <div>
            <button onClick={getUsers}>Get Users</button>
        </div>
        <div>
            {users.map(user =>
                <div key={user.email}>{user.email}</div>
            )}
        </div>
    </div>
  );
}

export default observer(App);
