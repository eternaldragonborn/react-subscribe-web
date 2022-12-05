import ModalEditArtist from "./ModalEditArtist";
import ModalUpdate from "./ModalUpdate";

export default function Modals({id}: { id: string }) {
  return (
    <>
      <ModalUpdate id={id}/>
      <ModalEditArtist id={id}/>
    </>
  );
}
