export interface EEWReportData {
    result: {
        status: string;

        message: string;

        is_auth: boolean;
    }

    report_time: string;

    region_code: string;

    request_time: string;

    region_name: string;

    longitude: string;

    is_cancel: string | boolean;

    depth: string;

    calcintensity: string;

    is_final: string | null;

    is_training: string | null;

    latitude: string;

    origin_time: string;

    security: {
        realm: string;

        hash: string;
    }

    magunitude: string;

    report_num: string;

    request_hypo_type: string;

    report_id: string;

    alertflg: string;
}