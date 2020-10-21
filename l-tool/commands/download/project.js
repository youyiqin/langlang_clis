import React from 'react'
import { Text, Box } from 'ink'
import PropTypes, { number } from 'prop-types'
import { createProjectStructureDirc } from '../../utils/project.js'
createProjectStructureDirc('35381138')

/// lxl download project --pid=xxx
const Project = ({ pid }) => {
  return <Text>download project</Text>
}

Project.propTypes = {
  pid: PropTypes.string.isRequired
}

export default Project
