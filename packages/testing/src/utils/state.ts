let accountSequence = 0;
let transactionSequence = 0;
let tokenSequence = 0;
let contractSequence = 0;
let topicSequence = 0;
let messageSequence = 0;
let scheduleSequence = 0;
let blockSequence = 0;

const state = {
  get accountSequence(): number {
    return accountSequence;
  },
  get transactionSequence(): number {
    return transactionSequence;
  },
  get tokenSequence(): number {
    return tokenSequence;
  },
  get contractSequence(): number {
    return contractSequence;
  },
  get topicSequence(): number {
    return topicSequence;
  },
  get scheduleSequence(): number {
    return scheduleSequence;
  },
  get blockSequence(): number {
    return blockSequence;
  },
  reset(): void {
    accountSequence = 0;
    transactionSequence = 0;
    tokenSequence = 0;
    contractSequence = 0;
    topicSequence = 0;
    messageSequence = 0;
    scheduleSequence = 0;
    blockSequence = 0;
  },
  incrementAccount(): number {
    return accountSequence++;
  },
  incrementTransaction(): number {
    return transactionSequence++;
  },
  incrementToken(): number {
    return tokenSequence++;
  },
  incrementContract(): number {
    return contractSequence++;
  },
  incrementTopic(): number {
    return topicSequence++;
  },
  incrementMessage(): number {
    return messageSequence++;
  },
  incrementSchedule(): number {
    return scheduleSequence++;
  },
  incrementBlock(): number {
    return blockSequence++;
  },
};

export { state };
