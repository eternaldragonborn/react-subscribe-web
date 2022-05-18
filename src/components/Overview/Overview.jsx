import { Container } from "@mui/material";
import { useEffect } from "react";
import { ErrorBoundary } from "../Utils";
import { OverviewTable } from "./OverviewTable";

export function Overview() {
  useEffect(() => {
    document.title = "訂閱總覽";
  }, []);

  return (
    <>
      <Container>
        <ErrorBoundary>
          <OverviewTable />
        </ErrorBoundary>
      </Container>
    </>
  );
}
