import { Address } from 'uk-clear-addressing';

export const formatRawPaf = (data: any) => {
    const pafRecord = {
        postcode: data.postcode,
        post_town: data.posttown,
        thoroughfare: data.thoroughfare_and_descriptor,
        building_name: data.building_name,
        organisation_name: data.organisation_name,
        ...data,
    };
    // console.log('data', data);
    let {
        line_1,
        line_2,
        line_3,
        premise,
        post_town,
        postcode,
    } = new Address(pafRecord);

    let fullAddress = '';
    let buildingNumber = 0;
    let deliveryPointSuffixNumber = 0;
    let deliveryPointSuffixLetter = 'A';

    if(!!line_1) {
        fullAddress = fullAddress.concat(line_1 + ', ');
    }
    if(!!line_2) {
        fullAddress = fullAddress.concat(line_2 + ', ');
    }

    if(!!line_3) {
        fullAddress = fullAddress.concat(line_3 + ', ');
    }
    if(!!post_town) {
        fullAddress = fullAddress.concat(post_town + ', ');
    }
    if(!!post_town) {
        fullAddress = fullAddress.concat(postcode);
    }

    // Extract building number and delivery point suffix for sorting
    if(!!pafRecord.building_number) {
        buildingNumber = Number(pafRecord.building_number);
    }

    if(!!pafRecord.delivery_point_suffix) {
        const numberNoStrings = (pafRecord.delivery_point_suffix).replace(/(^\d+)(.+$)/i, '$1');
        deliveryPointSuffixNumber = Number(numberNoStrings);
        deliveryPointSuffixLetter = (pafRecord.delivery_point_suffix).replace(numberNoStrings, '');
    }

    if(!pafRecord.delivery_point_suffix && !pafRecord.building_number) {
        const numberNoStrings = (pafRecord.fullAddress).replace(/(^.+)(\w\d+\w)(.+$)/i, '$2');
        // for multiple residences use delivery point suffix
        // for single residences use building number
        if(pafRecord.number_of_households > 1) {
            deliveryPointSuffixNumber = Number(numberNoStrings);
        } else {
            buildingNumber = Number(numberNoStrings);
        }
    }

    const body = {
        title: fullAddress,
        properties: {
            id: `${data.udprn}-0`,
            UDPRN: data.udprn,
            UMPRN: 0,
            FullAddress: fullAddress,
            AddressLine1: line_1,
            AddressLine2: line_2,
            AddressLine3: line_3,
            Premise: premise,
            PostTown: post_town,
            PostalCode: postcode,
            PostalCodeNoSpace: postcode.replace(' ', ''),
            BuildingNumber: buildingNumber,
            DeliveryPointSuffixNumber: deliveryPointSuffixNumber,
            DeliveryPointSuffixLetter: deliveryPointSuffixLetter,
        },
    };

    return body;
}
