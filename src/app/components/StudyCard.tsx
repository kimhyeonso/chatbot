import React from 'react'
import { StudyItem } from '@/types/study'
import styles from './StudyCard.module.scss'

type Pro = {
    item : StudyItem
}

const StudyCard = ({item} : Pro) => {
  return (
    <article className={styles.card}>
      <span>{item.id}</span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </article>
  )
}

export default StudyCard
