let messageSequence = 0;

export function createMessageId(role: string) {
  messageSequence += 1;

  return `${role}-${Date.now()}-${messageSequence}`;
}
