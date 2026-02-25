---
title: All Bounties Cross-Analysis
description: Cross-bounty synthesis, common themes, and selection strategies
category: bounty-research
created: 2026-02-22
status: complete
tags: [research, synthesis, strategy]
related:
  - ../01-overview/hackathon-overview.md
  - hiero-deep-dive.md
---

# Hedera Hello Future Apex Hackathon 2026: Comprehensive Bounty Research

**Hackathon Dates:** February 17 - March 23, 2026
**Total Prize Pool:** $250,000 USD
**Bounty Pool:** $48,000 USD ($8,000 per bounty)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Neuron Bounty: MLAT Aviation Surveillance](#1-neuron-bounty-mlat-aviation-surveillance)
3. [AWS Bounty: Enterprise Key Management](#2-aws-bounty-enterprise-key-management)
4. [Bonzo Bounty: Intelligent Keeper Agents](#3-bonzo-bounty-intelligent-keeper-agents)
5. [Hashgraph Online Bounty: AI Agent Registry](#4-hashgraph-online-bounty-ai-agent-registry)
6. [Hiero Bounty: Developer Tooling Libraries](#5-hiero-bounty-developer-tooling-libraries)
7. [Cross-Bounty Synthesis](#cross-bounty-synthesis)

---

## Executive Summary

This document provides comprehensive research on the five sponsored bounty tracks for the Hedera Hello Future Apex Hackathon 2026. Each bounty offers $8,000 in prizes ($4,000 / $3,000 / $1,000 for 1st/2nd/3rd place).

**Key Insights:**

- **Real-World Focus:** All bounties emphasize solving tangible problems over hype-driven concepts
- **Integration Depth:** Success requires meaningful integration with Hedera's core services
- **Production Readiness:** Judges will assess feasibility, execution quality, and adoption potential
- **Innovation Within Constraints:** Each bounty has clear technical parameters that must be followed

---

## 1. Neuron Bounty: MLAT Aviation Surveillance

**Prize Pool:** $8,000
**Focus:** Build a Multilateration (MLAT) system for aircraft localization using decentralized Mode-S data

### Technical Context

**Neuron Platform Architecture:**

- Decentralized Service Network (DSN) built on Hedera for IoT/edge devices
- Provides decentralized identity, micropayments, and verifiable data exchange
- Uses Hedera's high throughput (10,000+ TPS), low latency (~3s finality), and predictable fees
- 4DSky is the aviation-focused use case - a decentralized drone/aircraft tracking network

**4DSky Platform & SDK:**

- ADEX Framework enables distributed aviation data exchange
- Peers register on Hedera for discoverability
- Mode-S message streams are consumed from distributed receivers
- Real-time aviation data without centralized infrastructure

**MLAT (Multilateration) Fundamentals:**

Mode-S messages contain:

- Aircraft identification (ICAO address)
- Altitude, squawk code, and other telemetry
- **NOT** GPS coordinates (the core problem)

MLAT solves this by:

1. Multiple geographically distributed receivers timestamp the same Mode-S message
2. Time Difference of Arrival (TDOA) is calculated between receivers
3. Using hyperbolic positioning algorithms, aircraft location is triangulated
4. Requires: minimum 4 receivers for 3D positioning, precise time synchronization

### Real-World Problems This Solves

1. **Non-ADS-B Aircraft Coverage:** Many aircraft (general aviation, older aircraft, military) don't broadcast GPS positions. MLAT enables tracking without their cooperation.

2. **Rural/Remote Area Surveillance:** Ground radar is expensive to deploy. Distributed, low-cost receivers with MLAT can cover airspace at lower cost.

3. **Redundancy and Resilience:** Centralized surveillance systems have single points of failure. Decentralized networks provide backup infrastructure.

4. **Privacy-Preserving Tracking:** MLAT derives position without requiring aircraft to broadcast their location (useful for privacy-conscious operators).

### Technical Challenges

| Challenge                          | Description                                                 | Mitigation                                                               |
| ---------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Time Synchronization**           | MLAT requires microsecond-level sync between receivers      | NTP/PTP protocols; hardware GPS clocks; Hedera consensus timestamps      |
| **Receiver Coverage**              | Need sufficient receiver density for accurate triangulation | Incentivize receiver deployment via token rewards; use existing networks |
| **Message Correlation**            | Matching same message across multiple receivers             | Use message hash/ID fields; time windows with tolerance                  |
| **Geometry Dilution of Precision** | Poor receiver angles reduce accuracy                        | Weight least-squares solutions; reject low-quality geometries            |
| **Clock Drift**                    | Receiver clocks drift over time                             | Continuous calibration; reference transmitters                           |

### Project Ideas

#### Idea 1: "SkyRange - Community Aviation Coverage"

**Concept:** A community-powered MLAT network that covers underserved airspace regions (rural areas, developing regions) using crowdsourced receivers.

**Problem Solved:** Aviation surveillance gaps in areas where ground radar is economically unviable.

**Technical Approach:**

- Mobile app that turns any Android device with software radio (RTL-SDR) into a Mode-S receiver
- Hedera-based incentive system rewards contributors based on data quality and unique coverage
- MLAT processing runs in a distributed compute layer (IPFS + compute)
- Real-time aircraft positions displayed on map interface

**Authentic Differentiation:**

- Focus on **coverage gaps** rather than competing with existing providers
- Gamified contributor network with reputation scoring
- Integration with local aviation authorities for safety use cases

**Hedera Integration:**

- Receiver registration via Hedera Consensus Service (HCS)
- Micropayments in HBAR for data contributions
- Receiver reputation scores stored in Hedera file/Smart Contract

---

#### Idea 2: "GhostTrack - Privacy-First Aviation Surveillance"

**Concept:** MLAT system for tracking non-cooperative or privacy-conscious aircraft without requiring them to broadcast position data.

**Problem Solved:** Security monitoring and surveillance for aircraft that disable ADS-B or don't broadcast position (privacy flights, potential threats).

**Technical Approach:**

- Passive Mode-S receiver network (no transmission required)
- MLAT triangulation of aircraft that only broadcast identification
- Zero-knowledge proofs for query privacy (users can query positions without revealing their identity)
- Access control based on credentials (aviation authorities, verified security entities)

**Authentic Differentiation:**

- Focus on **security and privacy** use case (counter-terrorism, smuggling interdiction)
- Privacy-preserving query system using zero-knowledge proofs
- Complementary to existing systems rather than competitive

**Hedera Integration:**

- Access control via Hedera Token Service (security credentials)
- Query audit trail via Hedera Consensus Service
- Anonymous payment system for data access

---

#### Idea 3: "BackupSky - Resilient Aviation Infrastructure"

**Concept:** A decentralized backup aviation surveillance network that activates when primary systems fail.

**Problem Solved:** Single point of failure in centralized aviation surveillance; disaster recovery.

**Technical Approach:**

- Passive monitoring of existing ADS-B/Mode-S traffic
- On-demand MLAT processing when primary systems go offline
- Automatic failover detection using network health monitoring
- Integration with air traffic control systems via standard protocols (ASTERIX)

**Authentic Differentiation:**

- **Complementary** to existing infrastructure, not replacement
- Focus on **resilience and disaster recovery**
- B2B model selling to airports, airlines, aviation authorities

**Hedera Integration:**

- Health status reporting via HCS topics
- Failover triggering via smart contract (threshold-based)
- Service-level agreements encoded on-chain

---

### Submission Checklist for Neuron Bounty

- [ ] MLAT algorithm implementation (hyperbolic positioning / least squares)
- [ ] Integration with Neuron peer discovery on Hedera
- [ ] Consumption of Mode-S data via 4DSky SDK
- [ ] Time-correlated observation fusion from multiple receivers
- [ ] Position estimation output (coordinates + confidence)
- [ ] Demonstration of working system with live data
- [ ] Documentation of MLAT methodology and accuracy metrics

---

## 2. AWS Bounty: Enterprise Key Management

**Prize Pool:** $8,000
**Focus:** Secure key management solution using AWS KMS for Hedera transactions

### Technical Context

**AWS KMS Architecture:**

- Fully managed key management service backed by FIPS 140-3 Level 3 validated HSMs
- Supports symmetric, asymmetric (RSA/ECC), and HMAC keys
- For Hedera: ECC_SECG_P256K1 key spec matches ECDSA requirements
- Key operations (sign, verify, encrypt) never leave HSM boundary

**Hedera-AWS KMS Integration:**

1. Create asymmetric key in AWS KMS with ECC_SECG_P256K1
2. Set IAM policies for signing permissions (kms:Sign, kms:GetPublicKey)
3. Custom signer function fetches public key and signs transaction bytes
4. Convert public key to Hedera format for account creation
5. Sign transactions without private key ever leaving AWS

**Security Benefits:**

- Private keys never exposed to application memory
- Hardware-enforced trust boundary
- Automatic audit logging via CloudTrail
- Granular IAM access controls
- Automatic key rotation support

### Real-World Problems This Solves

1. **Enterprise Compliance Requirements:** SOC 2, PCI DSS, HIPAA require HSM-protected key storage

2. **Key Management at Scale:** Managing thousands of keys across teams/environments

3. **Insider Threat Prevention:** No single person has access to raw private keys

4. **Auditability:** Full audit trail of all key operations for compliance and forensics

5. **Operational Security:** Eliminate private key handling errors, exposure in logs, etc.

### Project Ideas

#### Idea 1: "CustodyVault - Multi-Tenant Custody Solution"

**Concept:** An enterprise-grade custody platform where multiple organizations can securely manage Hedera accounts with AWS KMS, with proper tenant isolation and audit trails.

**Problem Solved:** Companies (exchanges, custodians, fintechs) need to manage customer keys securely at scale while maintaining regulatory compliance.

**Technical Approach:**

- Multi-tenant AWS KMS key organization (customer-specific keys with proper KMS key policies)
- Hedera account abstraction layer (each tenant has isolated accounts)
- Role-based access control (operators, auditors, admins)
- Automated compliance reporting (CloudTrail integration → compliance dashboards)
- Key rotation automation without downtime

**Authentic Differentiation:**

- Focus on **B2B custody** use case, not retail wallet
- Proper multi-tenant architecture (not single-user demo)
- Compliance-first design with audit export capabilities

**Hedera Integration:**

- Multiple Hedera accounts managed per-tenant
- Scheduled transactions for multi-sig operations
- Topic messages for audit events

---

#### Idea 2: "HederaKMS-CLI - Developer Operations Tool"

**Concept:** A comprehensive CLI tool that simplifies AWS KMS + Hedera integration for DevOps teams, with features like transaction templates, batch operations, and secrets management.

**Problem Solved:** Developers struggle with the complexity of integrating AWS KMS signing into their Hedera applications.

**Technical Approach:**

- CLI with commands for: account creation, transaction signing, batch operations
- Configuration via environment variables / AWS Secrets Manager
- Transaction templates (common operations pre-configured)
- Local testing mode (use local keys for dev, KMS for prod)
- CI/CD integration (GitHub Actions, GitLab CI examples)

**Authentic Differentiation:**

- **Developer experience** focus, not just security
- Templates and patterns for common operations
- Local development workflow preservation

**Hedera Integration:**

- All Hedera transaction types supported
- Integration with Hedera SDKs (JS, Java, Go, Python)
- Support for scheduled transactions and smart contracts

---

#### Idea 3: "AuthorityDelegation - Institutional Delegation System"

**Concept:** A system enabling institutions to delegate transaction signing authority to third parties (operators, software agents) while maintaining custody via AWS KMS.

**Problem Solved:** Institutions want to enable autonomous agents or third-party services to execute transactions without giving up key custody.

**Technical Approach:**

- AWS KMS keys held by institution (custodian)
- Delegation mechanism: institution authorizes specific transaction patterns via policies
- Operator/agent submits unsigned transactions to approval queue
- Institution's KMS signs only approved transactions
- Policy engine enforces limits (amount, frequency, recipients)

**Authentic Differentiation:**

- **Delegation without custody transfer** - keys stay with institution
- Policy-based authorization (not just all-or-nothing)
- Integration with autonomous agents/AI systems

**Hedera Integration:**

- Smart contract for policy enforcement (on-chain authorization rules)
- Hedera Consensus Service for audit log of delegations
- Token Service for delegation tokens (revocable authority)

---

### Submission Checklist for AWS Bounty

- [ ] AWS KMS key creation (ECC_SECG_P256K1)
- [ ] Custom signer implementation using AWS SDK
- [ ] Hedera transaction signing with KMS-signed signatures
- [ ] Proper IAM policies with least privilege
- [ ] Audit logging demonstration (CloudTrail integration)
- [ ] At least one Hedera transaction submitted successfully
- [ ] Documentation of security architecture and best practices

---

## 3. Bonzo Bounty: Intelligent Keeper Agents

**Prize Pool:** $8,000
**Focus:** Build an intelligent keeper agent for Bonzo vaults using the Hedera Agent Kit

### Technical Context

**Bonzo Finance Vaults:**

- Smart contracts that accept deposits and issue yield-bearing vault tokens
- Strategies route assets to liquidity pools (SaucerSwap CLMM), lending, liquid staking
- Vaults handle accounting; strategies execute yield generation
- Concentrated Liquidity Market Maker (CLMM) vaults face impermanent loss risk

**Current Vault Limitations:**

- Reactive (respond after conditions change, not anticipate)
- Static parameters (ranges don't adapt to volatility)
- Simple keepers (harvest on schedule, no decision-making)
- Cannot digest off-chain context (news, sentiment)

**Hedera Agent Kit:**

- Open-source framework for AI agents on Hedera
- Plugin architecture (EVM, Token, Consensus, Wallet, etc.)
- Supports LangChain integration (v1 and Classic)
- Multiple AI providers (Ollama, Groq, OpenAI, Claude)
- Two execution modes: Human-in-the-Loop (HITL) and Autonomous

**Key Integration Points:**

- **Oracle Data:** SupraOracles for prices, volatility feeds
- **RAG Systems:** LangChain for news/sentiment analysis
- **Smart Contract Interaction:** EVM plugin for Bonzo vault calls
- **Decision Engine:** AI model trained on market conditions

### Real-World Problems This Solves

1. **Impermanent Loss in CLMM:** Dynamic range management reduces losses when volatility spikes

2. **Suboptimal Harvest Timing:** Harvesting rewards when reward token price is about to crash

3. **Risk-Return Mismatch:** Static strategies don't adjust to changing market risk

4. **Manual Management Overhead:** Vaults require constant monitoring and adjustment

### Project Ideas

#### Idea 1: "VolatilityGuard - Adaptive CLMM Manager"

**Concept:** An agent that dynamically adjusts liquidity ranges in Bonzo CLMM vaults based on volatility forecasts from SupraOracles.

**Problem Solved:** Impermanent loss in concentrated liquidity positions during volatile market conditions.

**Technical Approach:**

- Subscribe to SupraOracles volatility feeds (realized and implied volatility)
- Decision logic:
  - Low volatility: Tighten ranges (higher capital efficiency, more fees)
  - High volatility: Widen ranges (reduce IL risk)
  - Extreme volatility: Exit to single-sided or withdraw temporarily
- Execute via Hedera Agent Kit's EVM plugin (call `adjustPosition`)
- HITL mode for large adjustments; autonomous for routine rebalancing

**Authentic Differentiation:**

- Focus on **impermanent loss reduction** (real pain point for LPs)
- Backtest-driven strategy (show historical IL reduction)
- Conservative approach (not chasing yield, preserving capital)

**Hedera Integration:**

- SupraOracles for volatility data
- Bonzo vault smart contracts via EVM plugin
- HCS topics for transparency (broadcast all decisions)

---

#### Idea 2: "SentimentHarvest - News-Aware Reward Compounder"

**Concept:** An agent that uses RAG-based sentiment analysis to optimize harvest timing for Bonzo vault rewards.

**Problem Solved:** Harvesting rewards at optimal times based on market sentiment about reward tokens.

**Technical Approach:**

- RAG pipeline: Ingest crypto news (Twitter, Discord, news sites) → vector database → sentiment scores
- Decision logic:
  - Negative sentiment spike on reward token: Immediate harvest and swap to stablecoin
  - Positive sentiment trend: Delay harvest to let rewards appreciate
  - Neutral: Follow baseline schedule (e.g., every 6 hours)
- LangChain integration for RAG; Vercel AI SDK or Groq for inference
- Execute harvest + swap via Bonzo contracts + DEX aggregator

**Authentic Differentiation:**

- **Sentiment-aware** harvesting (novel approach)
- RAG implementation for contextual understanding
- Focus on real market inefficiency (harvest timing)

**Hedera Integration:**

- HCS for sentiment data publishing (transparency)
- Agent Kit for contract calls
- Token Service for reward token handling

---

#### Idea 3: "RiskAdapter - Multi-Strategy Vault Allocator"

**Concept:** An agent that monitors user risk tolerance and reallocates their vault deposits across Bonzo vault strategies based on market conditions and user preferences.

**Problem Solved:** Users have different risk profiles but vaults are one-size-fits-all; agent enables personalized vault management.

**Technical Approach:**

- User onboarding: Natural language chat to understand risk tolerance ("I want conservative yield")
- Agent maps user to vault strategy profile (CLMM vs single-sided vs lending)
- Ongoing monitoring:
  - Market conditions (volatility, correlation)
  - User's changing preferences (re-chat quarterly)
- Rebalance users' allocations across vaults when conditions change
- HITL for large allocations; autonomous for small adjustments

**Authentic Differentiation:**

- **Personalization** focus (agent knows user preferences)
- Multi-vault strategy allocation (not single-vault optimization)
- Natural language interface (UX innovation)

**Hedera Integration:**

- Agent Kit for all Bonzo vault interactions
- HCS for user preference attestation
- NFTs representing user strategy profiles

---

### Submission Checklist for Bonzo Bounty

- [ ] Hedera Agent Kit integration (JavaScript or Python SDK)
- [ ] Integration with external data source (SupraOracles, RAG/sentiment, or other)
- [ ] Autonomous decision-making logic (not just scheduled execution)
- [ ] Interaction with Bonzo vault smart contracts
- [ ] Working demonstration of agent making decisions
- [ ] Documentation of strategy and backtesting/results

---

## 4. Hashgraph Online Bounty: AI Agent Registry

**Prize Pool:** $8,000 (+ 100K HOL Points)
**Focus:** Register and build a useful AI agent in the HOL Registry Broker

### Technical Context

**HOL (Hashgraph Online) Standards SDK:**

- Open-source implementation of HCS-based standards
- HCS-10: Agent communication and discovery protocol
- Reference implementations for file storage, identity, governance
- Battle-tested with millions of on-chain transactions

**Hashnet MCP Server:**

- Universal gateway for agent discovery and communication
- Supports HCS-10, A2A, XMTP, MCP protocols
- Node.js implementation with workflows for discovery, registration, chat
- Cross-protocol and cross-chain support

**Agent Communication Protocols:**

| Protocol | Description                           | Use Case                                   |
| -------- | ------------------------------------- | ------------------------------------------ |
| HCS-10   | Hedera-based agent communication      | Decentralized, auditable agent messaging   |
| A2A      | Agent2Agent interoperability standard | Cross-framework agent compatibility        |
| XMTP     | Encrypted messaging protocol          | Secure, end-to-end encrypted communication |
| MCP      | Model Context Protocol                | AI agent tool discovery and invocation     |

**Agentic Society Concepts:**

- **Agent DAOs:** Collectives of agents making decisions together
- **Agent Hiring:** Agents contracting other agents for tasks
- **Agent Reputation:** ERC-8004 standard for trustless agent attestations
- **Agent Commerce:** UCP (Universal Commerce Protocol) for agent-to-agent transactions

### Real-World Problems This Solves

1. **Agent Discovery:** How do agents find each other across different platforms?

2. **Interoperability:** How can agents built with different frameworks communicate?

3. **Trust:** How can human users verify an agent's capabilities and reputation?

4. **Coordination:** How can agents work together on complex tasks?

5. **Monetization:** How can agents charge for services and pay other agents?

### Project Ideas

#### Idea 1: "AgentMatch - Skill-Based Agent Marketplace"

**Concept:** A marketplace where agents advertise their skills, and other agents (or humans) can discover and hire them based on capabilities and reputation.

**Problem Solved:** Agent discovery and hiring in a fragmented agentic ecosystem.

**Technical Approach:**

- Agents register with HOL Registry via HCS-10, declaring capabilities (skills, pricing, availability)
- Skill taxonomy: standardized categories (DeFi operations, data analysis, content creation, etc.)
- Reputation system: ERC-8004 attestations for completed jobs
- Matching algorithm:供需 matching based on skills, price, reputation
- Payment via HBAR (Hedera Token Service) with escrow smart contract

**Authentic Differentiation:**

- Focus on **agent-to-agent hiring** (not just human-agent)
- Standardized skill taxonomy for interoperability
- Escrow-based payments for trust minimization

**Hedera Integration:**

- HOL Registry for agent profiles (HCS-10)
- ERC-8004 for reputation attestations
- Token Service for escrow payments
- Smart Contracts for job agreements

---

#### Idea 2: "DAOVoter - Agent-Powered Governance Agent"

**Concept:** An agent that researches DAO proposals and votes on behalf of token holders who delegate to it, using RAG to understand proposal context and implications.

**Problem Solved:** DAO voter apathy and uninformed voting; token holders don't have time to research proposals.

**Technical Approach:**

- Agent registered via HOL Registry with "governance analyst" skill
- RAG pipeline: Ingest proposals → analyze implications → score against governance principles
- Delegation: Token holders delegate voting power to agent
- Voting: Agent casts votes based on analysis; publishes reasoning on HCS
- Feedback loop: Users can provide feedback to improve voting alignment

**Authentic Differentiation:**

- **Governance specialization** (not generic AI assistant)
- RAG for deep proposal understanding (not just keyword matching)
- Transparency (all votes and reasoning published on-chain)

**Hedera Integration:**

- HOL Registry for agent discovery
- HCS for publishing vote rationales
- Token Service for delegation tracking
- Smart Contracts for voting execution

---

#### Idea 3: "AgentArbitrage - Cross-Protocol Price Discovery Agent"

**Concept:** An agent that monitors prices across DEXs and identifies arbitrage opportunities, then coordinates with other agents (flash loan agents, execution agents) to capitalize on them.

**Problem Solved:** Coordination problem in MEV/arbitrage; requires multiple specialized agents working together.

**Technical Approach:**

- **Discovery Agent:** Registered via HOL, monitors price feeds, publishes opportunities
- **Flash Loan Agent:** Specialized in securing flash loans
- **Execution Agent:** Specialized in atomic transaction execution
- Agents discover each other via HOL Registry
- Agent-to-agent communication via HCS-10 for opportunity sharing and coordination
- Profit sharing encoded in smart contract

**Authentic Differentiation:**

- **Multi-agent coordination** for complex operations
- Each agent has specialized skill (not one agent does everything)
- Agent economy where agents pay each other for services

**Hedera Integration:**

- HOL Registry for all agent types
- HCS-10 for agent communication
- Token Service for profit distribution
- Smart Contracts for atomic multi-step operations

---

### Submission Checklist for HOL Bounty

- [ ] Agent registered via HOL Standards SDK or Hashnet MCP Server
- [ ] Reachable via HCS-10, A2A, XMTP, or MCP protocol
- [ ] Natural language chat interface for users
- [ ] Integration with Apex Hackathon dApp
- [ ] Demonstrates useful functionality (not just "Hello World")
- [ ] Documentation of agent capabilities and usage

---

## 5. Hiero Bounty: Developer Tooling Libraries

**Prize Pool:** $8,000
**Focus:** Build a Hiero-ready open-source library that improves developer experience

### Technical Context

**Hiero vs Public Hedera:**

- Hiero is the open-source codebase contributed to Linux Foundation Decentralized Trust
- Public Hedera is governed by Hedera Governing Council
- Hiero enables community contributions and private network deployments
- For this bounty: code should work with public Hedera mainnet/testnet

**hiero-enterprise-java (Reference Implementation):**

- Spring Boot integration for Java enterprises
- Configuration via `application.properties` or `.env`
- Modular design with proper separation of concerns
- Production-minded: error handling, logging, testing, CI/CD

**Identified Developer Pain Points:**

| Pain Point                                 | Severity | Impact                        |
| ------------------------------------------ | -------- | ----------------------------- |
| TypeScript 5.9+ compatibility issues       | High     | Type errors in newer projects |
| Insufficient JSDoc annotations             | Medium   | Poor IDE autocomplete         |
| Mirror Node operational costs              | High     | $500+/month to run own node   |
| Lack of React/Next.js integration          | Medium   | Complex frontend setup        |
| Scheduled transaction code incompatibility | Low      | Cross-wallet issues           |

**What Makes a Library Adoptable:**

1. **Solves a Real Pain Point:** Addresses actual developer friction
2. **Easy to Integrate:** Minimal setup, good defaults
3. **Well Documented:** Clear examples, API docs
4. **Maintained:** CI, tests, contribution guidelines
5. **Compatible:** Works with existing SDKs, not replacement

### Project Ideas

#### Idea 1: "Hiero Mirror Node Client - TypeScript Edition"

**Concept:** A strongly-typed TypeScript/JavaScript client for Hedera Mirror Node REST API with pagination helpers, retry logic, and caching.

**Problem Solved:** Developers must build ad-hoc REST clients for Mirror Node queries; no official typed client exists.

**Technical Approach:**

- Generate TypeScript types from Mirror Node OpenAPI spec
- Implement all REST endpoints with proper typing
- Pagination helpers (automatic cursor handling)
- Retry logic with exponential backoff
- Optional caching layer (Redis/In-memory)
- Query builder for complex filters

**Authentic Differentiation:**

- **Type-first** design (leverages TypeScript's strengths)
- Focus on **developer experience** (pagination, caching handled)
- Compatible with existing hiero-sdk-js (no duplication)

**Key Features:**

```typescript
// Example usage
const mirrorClient = new HieroMirrorClient({
  endpoint: "https://mainnet.mirrornode.hedera.com",
  cache: new RedisCache(), // optional
  retry: { maxRetries: 3 },
});

// Automatic pagination
const transactions = await mirrorClient.transactions.byAccount("0.0.12345").all(); // Fetches all pages automatically

// Complex queries with types
const nfts = await mirrorClient.nfts
  .byToken("0.0.54321")
  .withMetadata()
  .orderBy("timestamp", "desc")
  .limit(100)
  .get();
```

---

#### Idea 2: "Scheduled Transactions Toolkit"

**Concept:** A utility library that simplifies creating, signing, and tracking scheduled transactions on Hedera/Hiero, with support for multi-party coordination.

**Problem Solved:** Scheduled transactions have complex workflows (create, sign, schedule, track); error-prone to implement correctly.

**Technical Approach:**

- Abstraction layer over Hedera scheduled transaction primitives
- Template system for common scheduled transaction patterns
- Multi-party coordination helpers (collect signatures from multiple signers)
- Status tracking with webhook/callback support
- Expiry management and auto-cancellation
- Cross-wallet compatibility (handle different code formats)

**Authentic Differentiation:**

- Focus on **multi-party coordination** (enterprise use case)
- **Template library** for common patterns (escrow, time-lock, etc.)
- Production features: webhooks, retry, monitoring

**Key Features:**

```typescript
// Create a multi-sig scheduled transaction
const scheduledTx = new ScheduledTransactionBuilder()
  .type("MULTISIG_ESCROW")
  .participants(["0.0.11111", "0.0.22222", "0.0.33333"])
  .threshold(2) // 2 of 3 signatures required
  .transaction(tokenTransfer)
  .expiry(Duration.hours(24))
  .onStatusChange((status) => webhook.send(status))
  .build();

// Collect signatures
await scheduledTx.addSignature(signature1);
await scheduledTx.addSignature(signature2);

// Auto-submit when threshold reached
await scheduledTx.executeWhenReady();
```

---

#### Idea 3: "React Hooks for Hedera - @hiero/react"

**Concept:** A React/Next.js library with hooks for common Hedera operations (wallet connection, account balance, transactions, smart contracts).

**Problem Solved:** Frontend developers must build boilerplate for wallet connection, transaction handling, loading states, error handling.

**Technical Approach:**

- `useWalletConnection`: Hashpack/Metamask integration with persistence
- `useAccountBalance`: Real-time balance updates via Mirror Node
- `useTransaction`: Transaction submission with loading states, receipts, error handling
- `useSmartContract`: Read/write operations with caching
- `useScheduledTransaction`: Track scheduled transaction status
- TypeScript-first with full type safety
- SSR-compatible (works with Next.js)

**Authentic Differentiation:**

- **React/Next.js focused** (not generic wrapper)
- **Caching and reactivity** built-in (balances update automatically)
- **Error boundaries** and graceful degradation

**Key Features:**

```typescript
function WalletDashboard() {
  const { connect, isConnected, account } = useWalletConnection();
  const { balance, loading } = useAccountBalance(account);
  const { transferToken, status } = useTransaction();

  return (
    <div>
      <p>Balance: {loading ? '...' : `${balance} HBAR`}</p>
      <button onClick={() => transferToken('0.0.123', 100)}>
        Send 100 HBAR
      </button>
      {status === 'pending' && <Spinner />}
      {status === 'success' && <Success />}
    </div>
  );
}
```

---

### Submission Checklist for Hiero Bounty

- [ ] Public GitHub repository with clear license (Apache 2.0 or MIT)
- [ ] Clean library API with intuitive interfaces
- [ ] Basic tests (unit tests for core functionality)
- [ ] CI/CD configuration (GitHub Actions or similar)
- [ ] README with installation and quickstart examples
- [ ] Contribution guidelines (CONTRIBUTING.md, DCO sign-offs, or similar)
- [ ] Reference to hiero-enterprise-java patterns (if applicable)

---

## Cross-Bounty Synthesis

### Common Themes Across Bounties

| Theme                    | Neuron             | AWS             | Bonzo                | HOL                | Hiero         |
| ------------------------ | ------------------ | --------------- | -------------------- | ------------------ | ------------- |
| **Decentralization**     | ✓ (aviation data)  | ✓ (key access)  | ✓ (agent decisions)  | ✓ (agent registry) | -             |
| **Security**             | ✓ (data integrity) | ✓ (HSM signing) | ✓ (vault protection) | ✓ (agent trust)    | -             |
| **AI Integration**       | -                  | -               | ✓ (RAG/Agent Kit)    | ✓ (AI agents)      | -             |
| **Developer Experience** | -                  | -               | -                    | -                  | ✓ (libraries) |

### Bounty Selection Strategy

**For AI/ML Interest:**

- Bonzo (RAG, decision agents)
- HOL (agent registry, multi-agent systems)

**For Security/Infrastructure:**

- AWS (KMS, key management)
- Neuron (MLAT, aviation security)

**For Developer Tools:**

- Hiero (libraries, SDKs)

**For Systems Thinking:**

- Neuron (distributed systems, MLAT)
- HOL (multi-agent coordination)

### Hedera Services by Bounty

| Hedera Service              | Primary Bounty | Also Used In            |
| --------------------------- | -------------- | ----------------------- |
| **Consensus Service (HCS)** | HOL            | Neuron, Bonzo           |
| **Token Service (HTS)**     | Bonzo, HOL     | Neuron (incentives)     |
| **Smart Contracts**         | Bonzo          | AWS, HOL                |
| **Mirror Node**             | Hiero          | Bonzo (historical data) |
| **SDKs**                    | All bounties   | -                       |

---

## Submission Timeline & Best Practices

### Timeline (Based on Hackathon Dates)

| Week             | Activities                                                 |
| ---------------- | ---------------------------------------------------------- |
| **Feb 17-23**    | Bounty selection, architecture design, environment setup   |
| **Feb 24-Mar 2** | Core feature development, integration with Hedera services |
| **Mar 3-9**      | Testing, refinement, documentation                         |
| **Mar 10-16**    | Demo preparation, video recording, submission materials    |
| **Mar 17-23**    | Final polish, submission, optional improvements            |

### Submission Best Practices

**For All Bounties:**

1. **Start Early:** Integrations with Hedera services have learning curves
2. **Test on Testnet:** Use Hedera testnet for development; only use mainnet if required
3. **Document Everything:** Clear README, API docs, architecture diagrams
4. **Demo Quality:** Show real functionality, not screenshots
5. **Code Quality:** Clean code, tests, CI/CD where applicable

**Bounty-Specific Tips:**

**Neuron:**

- Focus on MLAT accuracy; show error rates and confidence intervals
- Demonstrate with real Mode-S data if possible
- Visualizations of position estimates vs. ground truth

**AWS:**

- Security first: show IAM policies, audit logs
- Demonstrate key rotation without downtime
- Show cost optimization strategies

**Bonzo:**

- Backtest your strategy if possible (historical data)
- Show decision logic transparency (why did agent do X?)
- Demonstrate both HITL and autonomous modes

**HOL:**

- Focus on agent utility, not just registration
- Show agent-to-agent communication if applicable
- Demonstrate natural language understanding

**Hiero:**

- Adoption focus: would developers actually use this?
- Performance: benchmarks vs. raw SDK usage
- Examples: multiple use cases showing versatility

---

## Resources

### Official Documentation

- **Hedera Docs:** https://docs.hedera.com
- **Hedera Portal:** https://portal.hedera.com
- **HOL Docs:** https://hol.org/docs
- **Bonzo Docs:** https://docs.bonzo.finance
- **Neuron Docs:** https://docs.neuron.world
- **4DSky Docs:** https://docs.4dsky.com

### SDKs & Tools

- **Hedera SDKs:** https://docs.hedera.com/hedera/sdks
- **Hedera Agent Kit:** https://github.com/hashgraph/hedera-agent-kit-js
- **HOL Standards SDK:** https://github.com/hashgraph-online/standards-sdk
- **Hashnet MCP:** https://github.com/hashgraph-online/hashnet-mcp-js
- **Hiero SDKs:** https://docs.hiero.org/sdks

### Community

- **Hedera Discord:** https://go.hellofuturehackathon.dev/apex-discord
- **Hedera YouTube:** Workshops and AMAs on hackathon playlist
- **GitHub Discussions:** Technical questions for each SDK

---

## Conclusion

This research document provides a foundation for developing authentic, problem-solving projects for each bounty track. The key to success is:

1. **Focus on Real Problems:** Each bounty addresses genuine pain points
2. **Deep Integration:** Meaningful use of Hedera services, not superficial
3. **Execution Quality:** Working demos, clean code, good documentation
4. **Innovation Within Constraints:** Creative solutions that respect bounty requirements

Good luck with your hackathon journey!

---

_Document compiled for the Hedera Hello Future Apex Hackathon 2026_
_All research based on official documentation and publicly available sources as of February 2026_
