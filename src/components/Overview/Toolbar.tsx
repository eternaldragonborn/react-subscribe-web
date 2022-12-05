import {useContext} from "react";
import {AuthContext} from "../../constants";
import {ModalBookUpload} from "./ModalBookUpload";
import {ModalPackUpload} from "./ModalPackUpload";

export default function Toolbar() {
  const {
    useUser: [user],
    useSubscribeData: [data],
  } = useContext(AuthContext);

  return (
    <>
      {data.subscribers[`<@${user.id}>`] && <ModalPackUpload/>}
      <ModalBookUpload/>
    </>
  );
}
