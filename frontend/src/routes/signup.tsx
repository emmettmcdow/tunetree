export default function Signup() {
  return (
    <>
      <h1> Sign-up </h1>
      <form>
        <input type="text" name="artist" placeholder="artist name"/><br/>
        <input type="text" name="email" placeholder="e-mail address"/><br/>
        <input type="password" name="password" placeholder="password"/><br/>
        <input type="password" name="confirm-password" placeholder="confirm password"/><br/>
        <input type="submit"/>
      </form>
    </>
  );
}
