export const calculate = (routing) => {
  return {
    qantasPoints: 10,
    statusCredits: 20,
    segments: [
      {
        routing: "jfk-lax",
        qantasPoints: 5,
        statusCredits: 10
      },
      {
        routing: "lax-sfo",
        qantasPoints: 5,
        statusCredits: 0
      }
    ]
  }
}
