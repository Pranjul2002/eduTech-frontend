import { FileProvider } from "./context/FileContext";
import "./upskilling-overrides.css";

export default function UpskillingLayout({ children }) {
  return <FileProvider>{children}</FileProvider>;
}