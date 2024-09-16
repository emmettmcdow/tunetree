export default function Login() {
  return (
    <>
      <h1> Login </h1>
      <form>
        <input type="text" name="username" placeholder="username"/><br/>
        <input type="password" name="password" placeholder="password"/><br/>
        <input type="submit"/>
      </form>
      <br/>
      <p>Or create an account<a href="/signup"> here</a></p>
    </>
  );
}
