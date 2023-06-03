import logger from '../../utils/logger.util';
import axios, { AxiosRequestConfig, Method, AxiosResponse } from 'axios';
import { Response } from 'express';

export const getCommonHeaders = () => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-UserType': 'USER',
    'X-SourceID': 'WEB',
    'X-ClientLocalIP': '192.168.29.188',
    'X-ClientPublicIP': '192.168.29.188',
    'X-MACAddress': 'ac:49:db:dd:78:b1'
  };
};
