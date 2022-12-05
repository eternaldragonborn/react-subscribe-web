import {Block} from "@mui/icons-material";
import {Container, Link} from "@mui/material";
import {Component} from "react";
import {IconHeader} from "./Icons";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    // 更新 state 以至於下一個 render 會顯示 fallback UI
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    console.log(error);
  }

  render() {
    if (this.state.hasError) {
      // 你可以 render 任何客製化的 fallback UI
      return (
        <Container
          sx={{
            bgcolor: "rgba(255, 167, 38, .5)",
            backdropFilter: "blur(4px)",
            p: 4,
            boxShadow: 3,
            borderRadius: 3,
          }}
        >
          <IconHeader
            icon={Block}
            color="red"
            headerSize="h5"
            header={
              <>
                頁面載入錯誤，請
                <Link
                  component={"button"}
                  fontSize="inherit"
                  fontWeight="bold"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  重新整理
                </Link>
                或
                <Link
                  component={"button"}
                  fontSize="inherit"
                  fontWeight="bold"
                  href="/subscribe-sys"
                >
                  回到首頁
                </Link>
              </>
            }
          />
        </Container>
      );
    }

    return this.props.children;
  }
}
