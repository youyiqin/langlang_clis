import fs from 'fs'
import path from 'path'
import axios from 'axios'

const Header = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8'
}

const client = axios.create({

})

const checkCertificateValid = async (cert: string) => {

}

export default function getCertificate(): string {

  return ''
}
