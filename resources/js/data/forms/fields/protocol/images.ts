import { UploadImagesField } from "../../../../components/forms/UploadImagesField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

function createImageField(
	id: TFormFieldName,
	showValueIn: TFormFieldName,
	max: number
): TFormField {
	return {
		id,
		Component: UploadImagesField,
		props: { max },
		showValueIn,
		showsImages: true,
		label: max > 1 ? "supporting_images" : "supporting_image",
		description: `${id}_description`,
		note: "upload_image_note",
		value: "",
		validate: null,
		required: false,
		useAsFilter: false,
		section: TSectionName.StudyDesign
	};
}

export const experimentalDesignImageField = createImageField(
	TFormFieldName.ExperimentalDesignImage,
	TFormFieldName.ExperimentalDesign,
	1
);

export const sampleSizeCalculationImageField = createImageField(
	TFormFieldName.SampleSizeCalculationImage,
	TFormFieldName.SampleSizeCalculation,
	1
);

export const additionalInformationImagesField = createImageField(
	TFormFieldName.AdditionalInformationImages,
	TFormFieldName.AdditionalInformation,
	3
);
