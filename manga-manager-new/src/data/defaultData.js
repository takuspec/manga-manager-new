export const defaultMagazines = [
  {
    id: 1,
    name: '週刊少年サンデー',
    frequency: 'weekly',
    releaseDay: 3,
    releaseDate: 1,
    baseDate: new Date().toISOString().slice(0, 10),
    baseIssue: 21,
    image: ''
  },
  {
    id: 2,
    name: '週刊少年ジャンプ',
    frequency: 'weekly',
    releaseDay: 1,
    releaseDate: 1,
    baseDate: new Date().toISOString().slice(0, 10),
    baseIssue: 21,
    image: ''
  }
]

export const defaultSeries = [
  {
    id: 101,
    title: 'レッドブルー',
    magazineId: 1,
    issueYear: 2026,
    issue: 21,
    status: 'ongoing',
    image: ''
  },
  {
    id: 201,
    title: 'ONE PIECE',
    magazineId: 2,
    issueYear: 2026,
    issue: 21,
    status: 'ongoing',
    image: ''
  }
]