import { ScanOption } from '../models/antivirus/state';

/** @todo: change to get from server */
export namespace MOCK {
  export const defaultPreset: ScanOption = {
    id: 0,
    path: [],
    checkMask: [],
    excludeMask: [],
    intensity: 'LOW',
    scheduleTime: {
      single: {
        date: 1,
      },
    },
    checkFileTypes: 'critical',
    saveCopyFilesDay: 31,
    cureFoundFiles: true,
    removeInfectedFileContent: true,
    checkDomainReputation: false,
    parallelChecks: 1,
    ramForCheck: 1024,
    fullLogDetails: true,
    maxScanTime: 1,
    autoUpdate: true,
    docroot: 'www/example.com',
    email: 'hehe@lol.kek',
    isActive: true,
  };
}
