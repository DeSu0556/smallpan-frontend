import Title from "antd/es/skeleton/Title";
import {Row} from "antd";

export default function Layout(props: any) {
  return (
    <>
      <Row justify='center'>
        <h1>Small Pan</h1>
      </Row>
      {props.children}
    </>
  )
};
