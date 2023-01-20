import { withUrqlClient } from "next-urql";
import Navbar from "../components/Navbar";
import { createUrqlCLient } from "../utils/createUrqlClient";

const Index = () => (
  <>
    <Navbar />
    <div>Hello</div>
  </>
);

//does not by default ssr but just sets up urql provider
//to ssr just give ssr true
export default withUrqlClient(createUrqlCLient, { ssr: true })(Index);
