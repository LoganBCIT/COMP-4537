import styled from '@emotion/styled'
import { SIZES } from '../styles/constants'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  /* ensure the container fills the viewport height so footer can be pushed down */
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 10px;
  max-width: ${SIZES.maxWidth};
`

export default Container
