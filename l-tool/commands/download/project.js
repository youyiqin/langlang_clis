// eslint-disable-next-line no-unused-vars
import React from 'react'
// eslint-disable-next-line no-unused-vars
import { Text, Box } from 'ink'
import PropTypes from 'prop-types'
import { createProjectStructureDirc } from '../../utils/project.js'

/// lxl download project --pid=xxx
const Project = ({ pid, rootPath = '.' }) => {
  const [createStructureState, setCreateStructureState] = React.useState({})
  React.useEffect(() => {
    const result = createProjectStructureDirc('35381138', rootPath)
    setCreateStructureState(result)
  }, [])
  return (
    <Box>
      <Text>download project: {pid}</Text>
      {
        createStructureState.success === true ? <Text>1</Text> : <Text>2</Text>
      }
      {
        createStructureState.success === false ? <Text>3</Text> : <Text>4</Text>
      }
    </Box>
  )
}

Project.propTypes = {
  pid: PropTypes.string.isRequired,
  rootPath: PropTypes.string
}

export default Project
