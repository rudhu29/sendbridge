import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WhiteBeltToolbox from "../components/whitebelt-toolbox";

// Mock the modules that require browser wallet objects or Stellar SDK wrappers
vi.mock("@creit.tech/stellar-wallets-kit", () => {
  class MockStellarWalletsKit {
    openModal = vi.fn();
    setWallet = vi.fn();
    getAddress = vi.fn().mockResolvedValue({ address: "GB..." });
    signTransaction = vi.fn().mockResolvedValue({ signedTxXdr: "AAAA..." });
  }
  return {
    StellarWalletsKit: MockStellarWalletsKit,
    WalletNetwork: { TESTNET: "TESTNET" },
    allowAllModules: vi.fn(),
  };
});

describe("WhiteBeltToolbox Component Tests", () => {
  test("renders the White Belt Toolbox connect card", () => {
    render(<WhiteBeltToolbox />);
    expect(screen.getByText(/Task 1: Connect Wallet/i)).toBeDefined();
  });

  test("renders the local sandbox generator header card", () => {
    render(<WhiteBeltToolbox />);
    expect(screen.getByText(/Local Sandbox Generator/i)).toBeDefined();
  });

  test("renders the diagnostics logger console box", () => {
    render(<WhiteBeltToolbox />);
    expect(screen.getByText(/DApp Diagnostics Logger/i)).toBeDefined();
  });
});
